const mongoose=require("mongoose");

const companyToCollegeSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company',
        required: true,
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'college',
        required: true,
    },
    location: {
        type: String,
    },
    role: {
        type: String,
        require: true,
    },
    package_lpa: {
        type: mongoose.Decimal128,
    },
    stipendDetails: {
        type: String
    },
    jobDescription: {
        type: String,
    },
    visitDate: {
        type: Date
    },
    applicationDeadline: {
        type: Date
    },
    minCgpa: {
        type: mongoose.Decimal128
    },
    allowedBranches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'branch'
    }],
    allowedYear: {
        type: [Number]
    },
    placeId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'placement'
    }]
},{timestamps:true});

const COMPANYTOCOLLEGE=mongoose.model('companyToCollege',companyToCollegeSchema);

module.exports=COMPANYTOCOLLEGE;