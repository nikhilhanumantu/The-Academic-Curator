const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String },
  fieldOfStudy: { type: String },
  startYear: { type: String },
  endYear: { type: String },
  grade: { type: String },
  description: { type: String },
});

const projectSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  technologies: [String],
  tags: [String],
  githubUrl: { type: String },
  liveUrl: { type: String },
  image: { type: String },
  link: { type: String }, // legacy
});

const certificationSchema = new mongoose.Schema({
  title: { type: String },
  issuer: { type: String },
  date: { type: String },
  link: { type: String },
  image: { type: String },
});

const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: { type: String }, // For easy identification in DB
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  major: { type: String, default: '' },
  location: { type: String, default: '' },
  phone: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  websiteUrl: { type: String, default: '' },
  headline: { type: String, default: '' },
  skills: {
    type: [String],
    default: [],
  },
  projects: {
    type: [projectSchema],
    default: [],
  },
  education: {
    type: [educationSchema],
    default: [],
  },
  certifications: {
    type: [certificationSchema],
    default: [],
  },
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
