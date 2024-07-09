const express = require('express');
const{handleregister,handledetails,handlelogin,getinfo,handlestart,givecoins,videoupload}=require('../controller/usercontroller')
const{validation}=require('../service/auth')
const upload=require('../middleware/uploads')
const uploadvid=require('../middleware/uploadvideo')
const router=express.Router();

router.post('/signin',handleregister);
router.post('/uploadinfo',validation,upload.fields([{ name: 'profileimage', maxCount: 1 }, { name: 'resume', maxCount: 1 }]),handledetails)
router.post('/login',handlelogin)
router.get('/getinfo',validation,getinfo)
router.get('/startinterview',validation,handlestart)
router.post('/givecoins',validation,givecoins);
router.post('/uploadvideo',validation,uploadvid.single('video'),videoupload);


// router.post('/firebaselogin',firebaselogin)

// router.get('/developer',developer)


module.exports=router