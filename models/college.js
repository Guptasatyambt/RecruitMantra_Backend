const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    contact_email: {
        type: String,
        required: true
    },
    contact_phone: {
        type: String,
        required: true
    },
    website: {
        type: String
    },
    established_year: {
        type: Number
    },
    activeCompanies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    }],
    upcomingCompanies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    }],
    previousVisitedCompanies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    }],
    capOperand: {
        type: String,
        enum: ['+', '*'],
        default: '*'
    },
    capValue: {
        type: mongoose.Decimal128,
        default: 1
    }
}, { timestamps: true });

const COLLEGE = mongoose.model('college', collegeSchema);

module.exports = COLLEGE;