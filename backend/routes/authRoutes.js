const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Recruiter = require('../models/Recruiter');

// @route   POST api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
  const { name, email, password, role, companyName } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    if (role === 'student') {
      const profile = new StudentProfile({ userId: user.id, name: user.name, education: [] });
      await profile.save();
    } else if (role === 'recruiter') {
      const recruiter = new Recruiter({ userId: user.id, companyName: companyName || 'Unknown Company' });
      await recruiter.save();
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: 360000 },
      async (err, token) => {
        if (err) throw err;
        
        let isProfileComplete = false;
        if (user.role === 'student') {
          const profile = await StudentProfile.findOne({ userId: user.id });
          if (profile && profile.bio && profile.skills && profile.skills.length >= 3) {
            isProfileComplete = true;
          }
        }
        
        res.json({ token, role: user.role, name: user.name, isProfileComplete });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: 360000 },
      async (err, token) => {
        if (err) throw err;
        
        let isProfileComplete = false;
        if (user.role === 'student') {
          const profile = await StudentProfile.findOne({ userId: user.id });
          if (profile && profile.bio && profile.skills && profile.skills.length >= 3) {
            isProfileComplete = true;
          }
        }
        
        res.json({ token, role: user.role, name: user.name, isProfileComplete });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get user data
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let isProfileComplete = false;
    
    if (user.role === 'student') {
      const profile = await StudentProfile.findOne({ userId: user.id });
      if (profile && profile.bio && profile.skills && profile.skills.length >= 3) {
        isProfileComplete = true;
      }
    }
    
    res.json({ ...user._doc, isProfileComplete });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
