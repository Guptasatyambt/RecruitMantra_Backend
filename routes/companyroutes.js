const express = require('express');
const {
    addCompany,
    updateCompany,
    getCompanyDetails,
    getAllCompanies,
    updateHiringStatus,
    getEligibleCompanies,
    deleteCompany
} = require('../controller/companycontroller');
const { validation, isCollegeAdmin } = require('../service/auth');
const router = express.Router();

router.post('/company/add', validation, isCollegeAdmin, addCompany);
router.post('/company/update/:company_id', validation, isCollegeAdmin, updateCompany);
router.get('/company/details/:company_id', validation, getCompanyDetails);
router.get('/company/list', validation, getAllCompanies);
router.post('/company/update-status/:company_id', validation, isCollegeAdmin, updateHiringStatus);
router.get('/company/eligible', validation, getEligibleCompanies);
router.delete('/delete/:company_id', validation, isCollegeAdmin, deleteCompany);

module.exports = router;
