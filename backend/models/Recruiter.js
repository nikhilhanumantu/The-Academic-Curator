const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  companyName: { type: String, required: true },
  position: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  bannerPicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  websiteUrl: { type: String, default: '' },
  industry: { type: String, default: '' },
  size: { type: String, default: '' },
  location: { type: String, default: '' },
  status: { type: String, default: 'Hiring Active' },
  mission: { type: String, default: '' },
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  savedCandidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  viewedCandidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Recruiter', recruiterSchema);
