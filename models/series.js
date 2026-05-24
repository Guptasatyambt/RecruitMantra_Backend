const mongoose=require("mongoose");
const { required } = require("nodemon/lib/config");

const seriesSchema = new mongoose.Schema({
  email: {
    type: String
  },
  Result: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  Technical1:{
    type: String
  },
  Technical2:{
    type: String
  },
  HR:{
    type: String
  },
  Managerial:{
    type: String
  },
  Result_Tech1:{
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  Result_Tech2:{
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  Result_HR:{
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  Result_Managerial:{
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  
}, { timestamps: true });

const SERIES=mongoose.model('series',seriesSchema);

module.exports=SERIES;