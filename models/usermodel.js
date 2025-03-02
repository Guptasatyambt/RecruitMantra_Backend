const mongoose=require("mongoose");
const Interview=require('./interview');

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        require:true,
        unique:true,
    },
    name:{  
        type:String,
        require:true,
    },
    password:{
        type:String,
        require:true,
    },
    profileimage:{
        type:String,
        require:true,
    },
    college:{
        type:String,
        require:true,
    },
    branch:{
        type:String,
        require:true,
    },
    specialization:{
        type:String,
        require:true,
    },
    year:{
        type:String,
        require:true
    },
    resume:{
        type:String,
        require :true,
    },
    coins:{
        type:Number,
        default:150,
    },
    interest:{
        type:String,
        require:true,
    },
    interview: [{
        _id: false,
        interview_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview',required:true },
        result: Number
    }],
    HRInterview: [{
        _id: false,
        interview_id: { type: mongoose.Schema.Types.ObjectId, ref: 'HRInterview',required:true },
        result: Number
    }],
    ManagerialInterview: [{
        _id: false,
        interview_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ManagerialInterview',required:true },
        result: Number
    }],
    SeriesInterview: [{
        _id: false,
        series_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SerisInterview',required:true },
        result: Number,
        completeness:{type:Number,min:0,max:100,default:0}
    }],
},{timestamps:true});

const USER=mongoose.model('user',userSchema);

module.exports=USER;