const mongoose=require("mongoose");

const interviewSchema=new mongoose.Schema({
    auther: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' ,
        required:true
      },
      email:{
        type:String
      },
      level:{
        type:String,
        required:true
      },
      result:{
        type:Number,
        min:0,
        max:10,
        default:0
      },
      confidence:{
        type:Number,
        min:0,
        max:100,
        default:0
      },
      accuracy:{
        type:Number,
        min:0,
        max:100,
        default:0
      },
      eye:{
        type:Number
      },
      neck:{
        type:Number
      },
      status:{
        type:Boolean,
        default:false,
      }

},{timestamps:true});

const INTERVIEW=mongoose.model('interview',interviewSchema);

module.exports=INTERVIEW;