const express = require('express');
const {handleapply,uploadresume,cheak} = require('../controller/careerscontroller')
const { validation } = require('../service/auth')
const router = express.Router();

router.post('/apply',validation, handleapply);

router.post('/uploadresume', validation, uploadresume)
router.post('/emailcheak',cheak)

module.exports = router
