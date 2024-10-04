const express = require('express');
const{handlestart,handlestop, getinfo,videoupload,getVideoUrl,ackServer,insertConfidence,insertAccuracy}=require('../controller/interview')
const router=express.Router();
const{validation}=require('../service/auth')

//for start interview
router.post('/start',validation,handlestart) //send level in body  {responce ex-"id": "66db52efa80c2e8e838b7f76"}

//called from video model when answer of all questions are updated
router.post('/stop',handlestop)   //send interview_id,result,confidence,accuracy,eye,neck,complete in body and token

//get detail of one perticuler interview
router.get('/getdetail',validation,getinfo)  // send  interview_id

//will return presigned url for uploading the video
router.post('/uploadvideo',validation,videoupload); // send "interview_id"  body

//for getting the url of the video
router.get('/getUrl',validation,getVideoUrl)   // sent interview_id in body

//for acknowledging the server that video is uploaded successfully
router.post('/ackServer',validation,ackServer);

//for inserting confidence for one perticuler question
router.post('/insertconfidence',insertConfidence)

//for inserting accuracy for one perticuler question
router.post('/insertaccuracy',insertAccuracy)

module.exports=router
