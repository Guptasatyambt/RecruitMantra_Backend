const mongoose=require("mongoose");
const Interview=require('./interview');
const { required } = require("nodemon/lib/config");

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
},{timestamps:true});

const USER=mongoose.model('user',userSchema);

module.exports=USER;