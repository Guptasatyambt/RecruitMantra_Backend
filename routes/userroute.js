const express = require('express');
const{handleregister,handledetails,handlelogin,getinfo}=require('../controller/usercontroller')
const{validation}=require('../service/auth')
const router=express.Router();

router.post('/',handleregister);
router.post('/signin',validation,handledetails)
router.get('/login',handlelogin)
router.get('/getinfo',validation,getinfo)
   

module.exports=router