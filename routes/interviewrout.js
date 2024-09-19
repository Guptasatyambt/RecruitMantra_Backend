const express = require('express');
const{handlestart,handlestop, getinfo,videoupload,getVideoUrl,ackServer}=require('../controller/interview')
const router=express.Router();
const{validation}=require('../service/auth')

router.post('/start',handlestart) //send level in body  {responce ex-"id": "66db52efa80c2e8e838b7f76"}
router.post('/stop',handlestop)   //send interview_id,result,confidence,accuracy,eye,neck,complete in body and token
router.get('/getdetail',getinfo)  // send  interview_id
router.post('/uploadvideo',validation,videoupload); // send "interview_id"  body
router.get('/getUrl',getVideoUrl)   // sent interview_id in body
router.post('/ackServer',ackServer);
module.exports=router

// router.post('/signin',handleregister);
// router.post('/uploadinfo',validation,upload.fields([{ name: 'profileimage', maxCount: 1 }, { name: 'resume', maxCount: 1 }]),handledetails)
// router.post('/login',handlelogin)
// router.get('/getinfo',validation,getinfo)
// router.get('/startinterview',validation,handlestart)
// router.post('/givecoins',validation,givecoins);
// router.post('/uploadvideo',validation,uploadvid.single('video'),videoupload); // send "uid" and "video" in body
