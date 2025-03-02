const mongoose=require("mongoose");

const hrinterviewSchema = new mongoose.Schema({
  email: {
    type: String
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

const HRINTERVIEW=mongoose.model('hrinterview',hrinterviewSchema);

module.exports=HRINTERVIEW;