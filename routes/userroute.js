const express = require('express');
const {test, registerDefaultUser, registerStudent, registerCollegeAdmin, registerSuperAdmin, handledetails, handlelogin, getinfo, getcoin, givecoins, handleimage, updateyear, updateresume, generateAndSendUrl, changePassword, uploadassets, sendVerifyEmailOtp, validateEmailotp, getAllCollegeAdmins } = require('../controller/usercontroller')
const { validation } = require('../service/auth')
const upload = require('../middleware/uploads')
const uploadvid = require('../middleware/uploadvideo')
const router = express.Router();

router.post('/register-default', registerDefaultUser);
router.post('/register-student', registerStudent);
router.post('/register-college-admin', registerCollegeAdmin);
router.post('/register-admin', registerSuperAdmin);
router.post('/register-college-admin', registerCollegeAdmin);
router.post('/updateassets', validation, uploadassets)
router.post('/uploadinfo', validation, handledetails)
router.post('/login', handlelogin)
router.get('/getinfo', validation, getinfo)
router.get('/getcoin', validation, getcoin)
router.post('/givecoins', validation, givecoins);
router.post('/updateimage', validation, handleimage);
router.post('/updateyear', validation, updateyear)
router.post('/updateresume', validation, updateresume)

// Super admin
router.post('/register-super-admin', registerSuperAdmin)

// College admin management routes

router.get('/college-admins', validation, getAllCollegeAdmins);

router.post('/emailvarification', validation, sendVerifyEmailOtp)
router.post('/varifyemail', validation, validateEmailotp)

router.post('/forgot-password', generateAndSendUrl) //send email with update url
router.post('/edit-password',validation, changePassword)

router.get('/testing',test)

// router.post('/firebaselogin',firebaselogin)

// router.get('/developer',developer)


module.exports=router