const express = require('express');
const {
    addCompany,
    addCompanyToCollege,
    updateCompany,
    getCompanyDetails,
    getAllCompanies,
    updateHiringStatus,
    getEligibleCompanies,
    deleteCompany,
    getCompaniesComingToCollege
} = require('../controller/companycontroller');
const { validation, isCollegeAdmin, isAdmin } = require('../service/auth');
const router = express.Router();

router.post('/add', validation, isAdmin, addCompany);
router.post('/add-company-to-college', validation, isCollegeAdmin, addCompanyToCollege)
router.post('/update/:company_id', validation, isCollegeAdmin, updateCompany);
router.get('/details/:company_id', validation, getCompanyDetails);
router.get('/list', validation, getAllCompanies);
router.get('/companies-to-college', validation, getCompaniesComingToCollege)
router.post('/update-status/:company_id', validation, isCollegeAdmin, updateHiringStatus);
router.get('/eligible', validation, getEligibleCompanies);
router.delete('/delete/:company_id', validation, isCollegeAdmin, deleteCompany);

module.exports = router;