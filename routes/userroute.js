const express = require('express');
const { handleregister, handledetails, handlelogin, getinfo, givecoins, handleimage, updateyear, updateresume, generateAndSendOTP, validateotp, updatepassword, uploadassets, sendVarifyEmailOtp,validateEmailotp } = require('../controller/usercontroller')
const { validation } = require('../service/auth')
const upload = require('../middleware/uploads')
const uploadvid = require('../middleware/uploadvideo')
const router = express.Router();

router.post('/signin', handleregister);
router.post('/updateassets', validation, uploadassets)
router.post('/uploadinfo', validation, handledetails)
router.post('/login', handlelogin)
router.get('/getinfo', validation, getinfo)
router.post('/givecoins', validation, givecoins);
router.post('/updateimage', validation, handleimage);
router.post('/updateyear', validation, updateyear)
router.post('/updateresume', validation, updateresume)

router.post('/emailvarification', validation, sendVarifyEmailOtp)
router.post('/varifyemail',validation,validateEmailotp)

router.post('/passwordresetreq', generateAndSendOTP) //send email
router.post('/validateotp', validateotp) //send email and otp
router.post('/updatepassword', updatepassword) //send email and password


// router.post('/firebaselogin',firebaselogin)

// router.get('/developer',developer)


module.exports = router