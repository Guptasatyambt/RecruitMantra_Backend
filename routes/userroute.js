const express = require('express');
const{handleregister,handledetails,handlelogin,getinfo}=require('../controller/usercontroller')
const{validation}=require('../service/auth')
const upload=require('../middleware/uploads')
const router=express.Router();

router.post('/',handleregister);
router.post('/signin',validation,upload.fields([{ name: 'profileimage', maxCount: 1 }, { name: 'resume', maxCount: 1 }]),handledetails)
router.get('/login',handlelogin)
router.get('/getinfo',validation,getinfo)

module.exports=router