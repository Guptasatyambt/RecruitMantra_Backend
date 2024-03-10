const mongoose=require("mongoose");

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
    interest:{
        type:String,
        require:true,
    }
},{timestamps:true});

const USER=mongoose.model('user',userSchema);

module.exports=USER;