const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Connection = require('../models/Connection');
const StudentProfile = require('../models/StudentProfile');

// @route   POST api/connections/request/:targetId
// @desc    Send a connection request
router.post('/request/:targetId', auth, async (req, res) => {
  try {
    // ── Prevent self-connection ───────────────────────────────────────
    if (req.user.id === req.params.targetId) {
      return res.status(400).json({ msg: 'You cannot connect with yourself' });
    }

    const existing = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: req.params.targetId },
        { requester: req.params.targetId, recipient: req.user.id },
      ]
    });

    if (existing) {
      return res.status(400).json({ msg: 'Connection already exists', status: existing.status });
    }

    const connection = new Connection({
      requester: req.user.id,
      recipient: req.params.targetId,
    });

    await connection.save();
    res.json(connection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/connections/respond/:connectionId
// @desc    Accept or reject a connection request
router.put('/respond/:connectionId', auth, async (req, res) => {
  const { action } = req.body; // 'accept' or 'reject'
  try {
    const connection = await Connection.findById(req.params.connectionId);
    if (!connection) return res.status(404).json({ msg: 'Connection not found' });
    if (connection.recipient.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    connection.status = action === 'accept' ? 'accepted' : 'rejected';
    await connection.save();

    // If accepted, add to each other's connections list in profile (try both schemas gracefully)
    if (connection.status === 'accepted') {
      const User = require('../models/User'); // Import if not at top
      const Recruiter = require('../models/Recruiter');

      // Helper to update whoever it belongs to
      const addConnection = async (ownerId, targetId) => {
        try {
          const student = await StudentProfile.findOneAndUpdate(
            { userId: ownerId }, { $addToSet: { connections: targetId } }
          );
          if (!student) {
            await Recruiter.findOneAndUpdate(
              { userId: ownerId }, { $addToSet: { connections: targetId } }
            );
          }
        } catch (e) {
           // Graceful proceed 
        }
      };

      await addConnection(connection.requester, connection.recipient);
      await addConnection(connection.recipient, connection.requester);
    }

    res.json(connection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections/my
// @desc    Get all accepted connections for current user (excludes self-connections)
router.get('/my', auth, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.user.id, status: 'accepted' },
        { recipient: req.user.id, status: 'accepted' },
      ],
      // Exclude any self-connections stored in DB
      $expr: { $ne: ['$requester', '$recipient'] },
    }).populate('requester', ['name', 'email'])
      .populate('recipient', ['name', 'email']);

    // Extra safety: strip out any connection where both sides resolve to the same user
    const safe = connections.filter(c =>
      c.requester._id.toString() !== c.recipient._id.toString()
    );

    res.json(safe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections/pending
// @desc    Get pending connection requests received by current user
router.get('/pending', auth, async (req, res) => {
  try {
    const pending = await Connection.find({
      recipient: req.user.id,
      status: 'pending',
    }).populate('requester', ['name', 'email']);
    res.json(pending);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections/status/:targetId
// @desc    Check connection status between current user and target
router.get('/status/:targetId', auth, async (req, res) => {
  try {
    const connection = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: req.params.targetId },
        { requester: req.params.targetId, recipient: req.user.id },
      ]
    });

    if (!connection) return res.json({ status: 'none' });
    
    // Determine if current user is requester or recipient
    const isRequester = connection.requester.toString() === req.user.id;
    res.json({ 
      status: connection.status, 
      connectionId: connection._id,
      isRequester 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/connections/:connectionId
// @desc    Remove a connection
router.delete('/:connectionId', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);
    if (!connection) return res.status(404).json({ msg: 'Not found' });

    const isParty = [connection.requester.toString(), connection.recipient.toString()].includes(req.user.id);
    if (!isParty) return res.status(403).json({ msg: 'Not authorized' });

    // Remove from profiles dynamically
    const Recruiter = require('../models/Recruiter');
    const removeConnection = async (ownerId, targetId) => {
      try {
        const student = await StudentProfile.findOneAndUpdate(
          { userId: ownerId }, { $pull: { connections: targetId } }
        );
        if (!student) {
          await Recruiter.findOneAndUpdate(
            { userId: ownerId }, { $pull: { connections: targetId } }
          );
        }
      } catch (e) {}
    };

    await removeConnection(connection.requester, connection.recipient);
    await removeConnection(connection.recipient, connection.requester);

    await connection.deleteOne();
    res.json({ msg: 'Connection removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
