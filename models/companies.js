const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    company_name: {
        type: String,
        require: true,
    },
    industry: {
        type: String,
        require: false,
    },
}, { timestamps: true });

const COMPANY = mongoose.model('company', companySchema);

module.exports = COMPANY;