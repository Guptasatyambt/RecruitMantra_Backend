const express = require('express');
const{handleregister,handledetails,handlelogin,getinfo,handlestart,givecoins,videoupload,handleimage,updateyear,updateresume}=require('../controller/usercontroller')
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
router.post('/uploadvideo',validation,uploadvid.single('video'),videoupload); // send "uid" and "video" in body
router.post('/updateimage',validation,upload.single('profileimage'),handleimage);
router.post('/updateyear',validation,updateyear)
router.post('/updateresume',validation,upload.single('resume'),updateresume)


// router.post('/firebaselogin',firebaselogin)

// router.get('/developer',developer)


module.exports=router