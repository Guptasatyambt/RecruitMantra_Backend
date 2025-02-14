const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    company_name: {
        type: String,
        require: true,
    },
    industry: {
        type: String,
        require: true,
    },
    position: {
        type: String,
        require: true,
    },
    package_lpa: {
        type: Number,
        require: true,
    },
    students_hired: {
        type: Number,
        default: 0,
    },
    job_description: {
        type: String,
        require: true,
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