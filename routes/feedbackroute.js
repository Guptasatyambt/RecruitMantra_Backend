const express = require('express');
const{handlefeedback,contactus}=require('../controller/feedbackcontroller')
const{validation}=require('../service/auth')
const router=express.Router();


router.post('/uploadfeedback',validation,handlefeedback)
router.post('/contact-us',contactus)
module.exports=router
