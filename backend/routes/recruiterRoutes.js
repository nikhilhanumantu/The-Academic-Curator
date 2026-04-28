const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Recruiter = require('../models/Recruiter');
const StudentProfile = require('../models/StudentProfile');
const Message = require('../models/Message');

// @route   GET api/recruiters/all
// @desc    Get all recruiters for discovery
router.get('/all', auth, async (req, res) => {
  try {
    const recruiters = await Recruiter.find().populate('userId', ['name', 'email']);
    res.json(recruiters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/recruiters/search
// @desc    Search students by keyword (name, skill, bio, major)
router.get('/search', auth, async (req, res) => {
  const { query, skills, location } = req.query;
  try {
    let filter = {};

    if (query) {
      const regex = new RegExp(query, 'i');
      filter.$or = [
        { bio: regex },
        { major: regex },
        { location: regex },
        { skills: { $elemMatch: { $regex: query, $options: 'i' } } },
      ];
    }

    if (skills && !query) {
      const skillsArray = skills.split(',').map(s => new RegExp(s.trim(), 'i'));
      filter.skills = { $in: skillsArray };
    }

    if (location && !query) {
      filter.location = new RegExp(location, 'i');
    }

    let profiles = await StudentProfile.find(filter).populate('userId', ['name', 'email']);

    // If query provided, also search by user name
    if (query) {
      const { User } = require('../models/User') || {};
      try {
        const UserModel = require('../models/User');
        const regex = new RegExp(query, 'i');
        const userMatches = await UserModel.find({ name: regex, role: 'student' });
        const userIds = userMatches.map(u => u._id.toString());
        if (userIds.length > 0) {
          const nameProfiles = await StudentProfile.find({ userId: { $in: userIds } }).populate('userId', ['name', 'email']);
          nameProfiles.forEach(p => {
            if (!profiles.find(m => m._id.toString() === p._id.toString())) {
              profiles.push(p);
            }
          });
        }
      } catch(e) { /* skip name search if User model fails */ }
    }

    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/recruiters/profile
// @desc    Get current recruiter profile
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await Recruiter.findOne({ userId: req.user.id }).populate('userId', ['name', 'email']);
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/recruiters/profile
// @desc    Update recruiter profile
router.put('/profile', auth, async (req, res) => {
  const { companyName, position, bio, linkedin, websiteUrl, industry, size, location, status, mission, profilePicture, bannerPicture } = req.body;
  const profileFields = {};
  if (companyName) profileFields.companyName = companyName;
  if (position) profileFields.position = position;
  if (bio !== undefined) profileFields.bio = bio;
  if (linkedin !== undefined) profileFields.linkedin = linkedin;
  if (websiteUrl !== undefined) profileFields.websiteUrl = websiteUrl;
  if (industry !== undefined) profileFields.industry = industry;
  if (size !== undefined) profileFields.size = size;
  if (location !== undefined) profileFields.location = location;
  if (status !== undefined) profileFields.status = status;
  if (mission !== undefined) profileFields.mission = mission;
  if (profilePicture !== undefined) profileFields.profilePicture = profilePicture;
  if (bannerPicture !== undefined) profileFields.bannerPicture = bannerPicture;

  try {
    let profile = await Recruiter.findOneAndUpdate(
      { userId: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true }
    ).populate('userId', ['name', 'email']);
    
    // Also if Name is passed, update User collection
    if (req.body.name) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id, { $set: { name: req.body.name } });
      profile = await Recruiter.findOne({ userId: req.user.id }).populate('userId', ['name', 'email']);
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/recruiters/stats
// @desc    Get live dashboard stats for a recruiter
router.get('/stats', auth, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user.id });
    if (!recruiter) return res.status(403).json({ msg: 'Not a recruiter' });

    // Count active chats (unique conversations)
    const chatCount = await Message.distinct('senderId', { receiverId: req.user.id }).then(ids => ids.length);
    const chatCount2 = await Message.distinct('receiverId', { senderId: req.user.id }).then(ids => ids.length);
    const uniqueChats = new Set([...await Message.distinct('senderId', { receiverId: req.user.id }), ...await Message.distinct('receiverId', { senderId: req.user.id })]);

    res.json({
      viewed: recruiter.viewedCandidates ? recruiter.viewedCandidates.length : 0,
      saved: recruiter.savedCandidates ? recruiter.savedCandidates.length : 0,
      chats: uniqueChats.size,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/recruiters/save
// @desc    Save a candidate
router.post('/save', auth, async (req, res) => {
  const { studentId } = req.body;
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user.id });
    if (!recruiter) return res.status(403).json({ msg: 'Not authorized as recruiter' });

    if (recruiter.savedCandidates.map(id => id.toString()).includes(studentId)) {
      return res.status(400).json({ msg: 'Candidate already saved' });
    }
    recruiter.savedCandidates.unshift(studentId);
    await recruiter.save();
    res.json({ saved: true, count: recruiter.savedCandidates.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/recruiters/save/:studentId
// @desc    Unsave a candidate
router.delete('/save/:studentId', auth, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user.id });
    if (!recruiter) return res.status(403).json({ msg: 'Not authorized' });
    recruiter.savedCandidates = recruiter.savedCandidates.filter(id => id.toString() !== req.params.studentId);
    await recruiter.save();
    res.json({ saved: false, count: recruiter.savedCandidates.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/recruiters/view/:studentId
// @desc    Track that a recruiter viewed a candidate
router.post('/view/:studentId', auth, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user.id });
    if (!recruiter) return res.status(403).json({ msg: 'Not authorized' });
    if (!recruiter.viewedCandidates.map(id => id.toString()).includes(req.params.studentId)) {
      recruiter.viewedCandidates.push(req.params.studentId);
      await recruiter.save();
    }
    res.json({ viewed: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/recruiters/saved
// @desc    Get saved candidates with profiles
router.get('/saved', auth, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user.id });
    if (!recruiter) return res.status(400).json({ msg: 'Not a recruiter' });

    const profiles = await StudentProfile.find({
      userId: { $in: recruiter.savedCandidates }
    }).populate('userId', ['name', 'email']);

    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/recruiters/:id
// @desc    Get recruiter profile by target user ID
router.get('/:id', auth, async (req, res) => {
  try {
    // If the ID passed is user string
    const recruiter = await Recruiter.findOne({ userId: req.params.id }).populate('userId', ['name', 'email']);
    if (!recruiter) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.json(recruiter);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
