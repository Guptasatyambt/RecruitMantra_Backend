const mongoose=require("mongoose");

const studentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'college',
        required: true,
    },
    rollNo:{
        type:String,
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'branch',
    },
    year: {
        type: Number,
    },
    cgpa: {
        type: mongoose.Decimal128,
        required: false,
        default: 0,
    },
    highSchool: {
        type: mongoose.Decimal128,
        required: false,
        default: 0,
    },
    intermediate: {
        type: mongoose.Decimal128,
        required: false,
        default: 0,
    },
    resume: {
        type: String,
    },
    coins: {
        type: Number,
        default: 100,
    },
    interest:{
        type:String
    },
    cap: {
        type: mongoose.Decimal128,
        default: 0,
    },
    appliedCompanies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    }]
},{timestamps:true});

const STUDENT=mongoose.model('student',studentSchema);

module.exports=STUDENT;