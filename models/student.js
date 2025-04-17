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
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'branch',
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    cgpa: {
        type: mongoose.Decimal128,
        required: true,
        default: 0,
    },
    resume: {
        type: string,
        required: true,
    },
    coins: {
        type: Number,
        required: true,
        default: 100,
    },
    cap: {
        type: mongoose.Decimal128,
        required: true,
        default: 0,
    },
    appliedCompanies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    }]
},{timestamps:true});

const STUDENT=mongoose.model('student',studentSchema);

module.exports=STUDENT;