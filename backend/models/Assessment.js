const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicPerformance: { type: Number, required: true },
  programmingSkills: { type: Number, required: true },
  webDevSkills: { type: Number, required: true },
  dataSkills: { type: Number, required: true },
  securitySkills: { type: Number, required: true },
  networkingSkills: { type: Number, required: true },
  systemDesignSkills: { type: Number, required: true },
  communicationSkills: { type: Number, required: true },
  projectManagementSkills: { type: Number, required: true },
  interests: { type: [String], default: [] },
  certifications: { type: [String], default: [] },
  predictedCareer: { type: String, required: true },
  confidence: { type: Number, required: true },
  probabilityDistribution: { type: Map, of: Number },
  missingSkills: [{
    key: String,
    name: String,
    score: Number,
    required: Number
  }],
  generalGaps: [{
     key: String,
     name: String,
     score: Number,
     required: Number
  }],
  strengths: [{
    key: String,
    name: String,
    score: Number
  }],
  roadmap: [{
    phase: String,
    timeline: String,
    objectives: String,
    tasks: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
