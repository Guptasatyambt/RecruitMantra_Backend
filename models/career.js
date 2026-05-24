const mongoose=require("mongoose");

const applicantSchema=new mongoose.Schema({
    email:{
        type:String,
        require:true,
    },
    name:{  
        type:String,
        require:true,
    },
    mobile:{
        type:String,
        require:true,
    },
    gender:{
        type:String,
        require:true,
    },
    state:{
        type:String,
        require:true,
    },
    city:{
        type:String,
        require:true,
    },
    address:{
        type:String,
        require:true,
    },
    high_school_board:{
        type:String,
        require:true,
    },
    high_school_percentage:{
        type:String,
        require:true,
    },
    intermidiate_board:{
        type:String,
        require:true,
    },
    intermidiate_percentage:{
        type:String,
        require:true,
    },
    UG_percentage:{
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
    passing_year:{
        type:String,
        require:true
    },
    resume:{
        type:String,
        require :true,
    },
    skills:{
        type:String,
        require:true,
    },
   position:{
	type:String,
	require:true,
    }
},{timestamps:true});

const APPLICANT=mongoose.model('applicant',applicantSchema);

module.exports=APPLICANT;
