const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const StudentProfile = require('../models/StudentProfile');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/students
// @desc    Get all student profiles for discovery
router.get('/', authMiddleware, async (req, res) => {
  try {
    const profiles = await StudentProfile.find().populate('userId', ['name', 'email']);
    res.json(profiles);
  } catch (err) {
    console.error('GET / error:', err.message);
    res.status(500).send('Server Error');
  }
});

// ─── GET /api/students/profile/me ────────────────────────────────────────────
// IMPORTANT: Must be defined BEFORE /:userId to avoid shadowing!
// Returns the logged-in student's full profile
router.get('/profile/me', authMiddleware, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('GET /profile/me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/students/profile ──────────────────────────────────────────────
// Creates or updates the student's profile (upsert).
// Saves ALL fields: skills, projects, certifications, education, etc.
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      headline,
      bio,
      major,
      location,
      phone,
      github,
      linkedin,
      websiteUrl,
      profilePicture,
      skills,
      projects,
      certifications,
      education,
    } = req.body;

    // Build the update object — only include fields that were actually sent
    const updateFields = {
      // Always set name from auth token so it's searchable in DB
      name: req.user.name,
    };

    if (headline !== undefined) updateFields.headline = headline;
    if (bio !== undefined) updateFields.bio = bio;
    if (major !== undefined) updateFields.major = major;
    if (location !== undefined) updateFields.location = location;
    if (phone !== undefined) updateFields.phone = phone;
    if (github !== undefined) updateFields.github = github;
    if (linkedin !== undefined) updateFields.linkedin = linkedin;
    if (websiteUrl !== undefined) updateFields.websiteUrl = websiteUrl;
    if (profilePicture !== undefined) updateFields.profilePicture = profilePicture;

    // ── Array fields ──────────────────────────────────────────────────────────
    // These are always replaced in full so the frontend is the source of truth.

    if (Array.isArray(skills)) {
      // Filter out empty strings
      updateFields.skills = skills.filter(s => typeof s === 'string' && s.trim() !== '');
    }

    if (Array.isArray(projects)) {
      updateFields.projects = projects.map(p => ({
        title: p.title || '',
        description: p.description || '',
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
        tags: Array.isArray(p.tags) ? p.tags : [],
        githubUrl: p.githubUrl || '',
        liveUrl: p.liveUrl || '',
        image: p.image || '',
        link: p.link || '',   // legacy field
      }));
    }

    if (Array.isArray(certifications)) {
      updateFields.certifications = certifications.map(c => ({
        title: c.title || '',
        issuer: c.issuer || '',
        date: c.date || '',
        link: c.link || '',
        image: c.image || '',
      }));
    }

    if (Array.isArray(education)) {
      updateFields.education = education.map(e => ({
        school: e.school || '',
        degree: e.degree || '',
        fieldOfStudy: e.fieldOfStudy || '',
        startYear: e.startYear || '',
        endYear: e.endYear || '',
        grade: e.grade || '',
        description: e.description || '',
      }));
    }

    // ── Upsert (create if not exists, update if exists) ───────────────────────
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateFields },
      {
        new: true,        // return the updated document
        upsert: true,     // create if not found
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json(profile);
  } catch (err) {
    console.error('POST /profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── GET /api/students/profile/:userId ───────────────────────────────────────
// IMPORTANT: Must be defined BEFORE /:userId to avoid shadowing!
// Public route — view any student's profile by their userId (for recruiters etc.)
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const profile = await StudentProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('GET /profile/:userId error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── DELETE /api/students/profile ────────────────────────────────────────────
// Deletes the logged-in student's profile
router.delete('/profile', authMiddleware, async (req, res) => {
  try {
    await StudentProfile.findOneAndDelete({ userId: req.user.id });
    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    console.error('DELETE /profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/:userId
// @desc    Get a student's profile by userId
// IMPORTANT: This wildcard route MUST come AFTER all /profile/* routes
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const profile = await StudentProfile.findOne({ userId }).populate('userId', ['name', 'email']);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error('GET /:userId error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;