const mongoose=require("mongoose");

const applicationFormSchema = new mongoose.Schema({
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'college',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company',
        required: true
    },
    studentsApplied: [{
        type: mongoose.Schema.Types.studentId,
        ref: 'user'
    }]
},{timestamps:true});

const APPLICATIONFORM=mongoose.model('applicationForm',applicationFormSchema);

module.exports=APPLICATIONFORM;