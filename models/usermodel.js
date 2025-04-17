const mongoose=require("mongoose");
const Interview=require('./interview');

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        require:true,
        unique:true,
    },
    firstName:{  
        type:String,
        require:true,
    },
    lastName:{  
        type:String,
        require:true,
    },
    password:{
        type:String,
        require:true,
    },
    role: {
        type: String,
        enum: ['student', 'college_admin', 'super_admin', 'default'],
        default: 'student',
        required: true
    },
    profileimage:{
        type:String,
        require:true,
    },
    interview: [{
        _id: false,
        interview_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview',required:true },
        result: Number
    }]
},{timestamps:true});

const USER=mongoose.model('user',userSchema);

module.exports=USER;