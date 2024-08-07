const express = require('express');
const{handlestop, getinfo}=require('../controller/interview')
const router=express.Router();

router.post('/stop',handlestop)   //send level,result,confidence,accuracy,eye,neck,complete in body and token
router.get('/getdetail',getinfo)  //nothing to send
module.exports=router

// router.post('/signin',handleregister);
// router.post('/uploadinfo',validation,upload.fields([{ name: 'profileimage', maxCount: 1 }, { name: 'resume', maxCount: 1 }]),handledetails)
// router.post('/login',handlelogin)
// router.get('/getinfo',validation,getinfo)
// router.get('/startinterview',validation,handlestart)
// router.post('/givecoins',validation,givecoins);
// router.post('/uploadvideo',validation,uploadvid.single('video'),videoupload); // send "uid" and "video" in body
