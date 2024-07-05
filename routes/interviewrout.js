const express = require('express');
const{handlestart,handlestop, getinfo,givecoin,getinfoone}=require('../controller/interview')
const router=express.Router();

router.post('/start',handlestart);  //send query of level
router.post('/stop/:id',handlestop)   //send result,confidence,accuracy,eye,neck in body and id of interview in params
router.get('/getdetail',getinfo)  //nothing to send
router.post('/givecoins',givecoin); //give query of level and result
router.get('/getinfo/:interviewid',getinfoone); //give params of id


module.exports=router