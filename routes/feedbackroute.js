const express = require('express');
const{handlefeedback}=require('../controller/feedbackcontroller')
const{validation}=require('../service/auth')
const router=express.Router();


router.post('/uploadfeedback',validation,handlefeedback)

module.exports=router
