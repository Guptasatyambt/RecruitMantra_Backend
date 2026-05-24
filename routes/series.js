const express = require('express');
const { handlestart,
    getinfo,
    insertInterview} = require('../controller/seriescontroller')
const { validation } = require('../service/auth')
const router = express.Router();

router.post('/startseries',validation, handlestart);

router.get('/getinfo', validation, getinfo)
router.post('/insert',validation,insertInterview)

module.exports = router
