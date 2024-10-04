const mongoose=require("mongoose");
const { required } = require("nodemon/lib/config");

const interviewSchema = new mongoose.Schema({
  email: {
    type: String
  },
  level: {
    type: String,
    required: true
  },
  Result: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  video: [{
    _id: false,
    question: String,
    key: String,
  }],
  
  // Individual performance metrics for each question
  accuracy: [{
    _id: false,
    questionNumber: String,
    value: {
      type: String,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  confidence: [{
    _id: false,
    questionNumber: String,
    value: {
      type: String,
      
    }
  }],
  eye: [{
    _id: false,
    questionNumber: Number,
    value: {
      type: Number,
      default: 0
    }
  }],
  neck: [{
    _id: false,
    questionNumber: Number,
    value: {
      type: Number,
      default: 0
    }
  }],
  
  // Overall performance metrics
  overallAccuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  overallConfidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  overallEye: {
    type: Number,
    default: 0
  },
  overallNeck: {
    type: Number,
    default: 0
  },
 
  
}, { timestamps: true });

const INTERVIEW=mongoose.model('interview',interviewSchema);

module.exports=INTERVIEW;