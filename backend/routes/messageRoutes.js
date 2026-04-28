const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// @route   POST api/messages
// @desc    Send a message (text and/or attachment)
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, message, attachment, attachmentType } = req.body;
    
    if (!receiverId) return res.status(400).json({ msg: 'Receiver ID is required' });
    // Prevent self-messaging
    if (receiverId === req.user.id) {
      return res.status(400).json({ msg: 'You cannot message yourself' });
    }
    if (!message && !attachment) {
      return res.status(400).json({ msg: 'Message text or attachment is required' });
    }

    const newMessage = new Message({
      senderId: req.user.id,
      receiverId,
      message: message || '',
      attachment,
      attachmentType
    });

    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/messages/conversations
// @desc    Get all conversations for the logged-in user (last message per user)
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages involving current user that they haven't deleted
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      deletedFor: { $ne: userId }
    }).sort({ createdAt: -1 });

    // Build conversation map (unique partner → last message)
    const conversationMap = new Map();
    for (const msg of messages) {
      const partnerId = msg.senderId.toString() === userId
        ? msg.receiverId.toString()
        : msg.senderId.toString();

      // Skip self-messages (senderId === receiverId)
      if (partnerId === userId) continue;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, msg);
      }
    }

    // Resolve partner user info
    const conversations = [];
    for (const [partnerId, lastMsg] of conversationMap.entries()) {
      const partnerUser = await User.findById(partnerId).select('name email role');
      if (partnerUser) {
        conversations.push({
          _id: partnerId,
          targetUser: partnerUser,
          lastMessage: {
            text: lastMsg.deletedForEveryone ? '🚫 This message was deleted' : lastMsg.message,
            createdAt: lastMsg.createdAt,
          },
          unread: false, // could be extended with read tracking
        });
      }
    }

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/messages/history/:targetUserId
// @desc    Get full message history with a specific user
router.get('/history/:targetUserId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.targetUserId;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: targetId },
        { senderId: targetId, receiverId: userId },
      ]
    }).sort({ createdAt: 1 });

    const targetUser = await User.findById(targetId).select('name email role');

    // Format messages for frontend
    const formattedMessages = messages
      .filter(msg => !msg.deletedFor.includes(userId))
      .map(msg => ({
        _id: msg._id,
        sender: msg.senderId.toString(),
        receiver: msg.receiverId.toString(),
        text: msg.deletedForEveryone ? '🚫 This message was deleted' : msg.message,
        attachment: msg.deletedForEveryone ? null : msg.attachment,
        attachmentType: msg.deletedForEveryone ? null : msg.attachmentType,
        createdAt: msg.createdAt,
        deletedForEveryone: msg.deletedForEveryone
      }));

    res.json({ messages: formattedMessages, targetUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/messages/:id
// @desc    Delete a message
router.delete('/:id', auth, async (req, res) => {
  try {
    const { type } = req.body; // 'me' or 'everyone'
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: 'Message not found' });

    if (type === 'everyone') {
      if (message.senderId.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Only sender can delete for everyone' });
      }
      message.deletedForEveryone = true;
    } else {
      if (!message.deletedFor.includes(req.user.id)) {
        message.deletedFor.push(req.user.id);
      }
    }
    await message.save();
    res.json({ msg: 'Message deleted', data: message });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
