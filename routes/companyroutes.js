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
    getCompaniesComingToCollege,
    updateCompanyToCollege,
    getCompanytoCollegeDetails,
    applyCompanyToCollege
} = require('../controller/companycontroller');
const { validation, isCollegeAdmin, isAdmin } = require('../service/auth');
const router = express.Router();

router.post('/add', validation, addCompany);
router.post('/add-company-to-college', validation, isCollegeAdmin, addCompanyToCollege)
router.put('/update-company-tocollege/:_id',validation,isCollegeAdmin,updateCompanyToCollege)
router.get('/details-to-college/:company_id', validation, getCompanytoCollegeDetails);
router.get('/list', validation, getCompaniesComingToCollege);
router.post('/apply/:company_id', validation, applyCompanyToCollege)

router.get('/details/:company_id', validation, getCompanyDetails);
router.get('/all-companies', validation, getAllCompanies)
router.post('/update/:company_id', validation, isCollegeAdmin, updateCompany);
router.delete('/delete/:company_id', validation, isCollegeAdmin, deleteCompany);

router.post('/update-status/:company_id', validation, isCollegeAdmin, updateHiringStatus);
router.get('/eligible', validation, getEligibleCompanies);


module.exports = router;
