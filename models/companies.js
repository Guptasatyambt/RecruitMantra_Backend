const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    company_name: {
        type: String,
        require: true,
    },
    college_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'college',
        required: true
    },
    industry: {
        type: String,
        require: false,
    },
    position: {
        type: String,
        require: false,
    },
    package_lpa: {
        type: Number,
        require: false,
    },
    students_hired: {
        type: Number,
        default: 0,
    },
    hired_students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    job_description: {
        type: String,
        require: false,
    },
    visit_date: {
        type: Date,
        require: true,
    },
    application_deadline: {
        type: Date,
        require: true,
    },
    eligibility_criteria: {
        min_cgpa: {
            type: Number,
            require: true,
        },
        allowed_branches: [{
            type: String,
            require: true,
        }],
        allowed_batch_year: {
            type: String,
            require: true,
        }
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    }
}, { timestamps: true });

const COMPANY = mongoose.model('company', companySchema);

module.exports = COMPANY;