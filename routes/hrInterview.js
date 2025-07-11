const express = require('express');
const{handlestart,
    handlestop,
    getinfo,
    videoupload,
    ackServer,
    getVideoUrl,
    insertConfidence}=require('../controller/hrinterview')
const router=express.Router();
const{validation}=require('../service/auth')

//for start interview
router.post('/start',validation,handlestart) //send level in body  {responce ex-"id": "66db52efa80c2e8e838b7f76"}

//called from video model when answer of all questions are updated
router.post('/stop',validation,handlestop)   //send interview_id,result,confidence,accuracy,eye,neck,complete in body and token

//get detail of one perticuler interview
router.get('/getdetail',validation,getinfo)  // send  interview_id

router.post('/ackServer',validation,ackServer)

//will return presigned url for uploading the video
router.post('/uploadvideo',validation,videoupload); // send "interview_id"  body

//for getting the url of the video
router.get('/getUrl',validation,getVideoUrl)   // sent interview_id in body

//for inserting confidence for one perticuler question
router.post('/insertconfidence',insertConfidence)

module.exports=router
