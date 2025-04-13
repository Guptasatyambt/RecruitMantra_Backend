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
    }
}, { timestamps: true });

const COLLEGE = mongoose.model('college', collegeSchema);

module.exports = COLLEGE;