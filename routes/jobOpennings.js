const express = require('express');
const {
    addOpenning,
    removeOpenning,
    getOpenings,
    getOneOpenning,
    locationSearch,
    titleSearch
} = require('../controller/jobOpenning');
const { validation } = require('../service/auth');
const router = express.Router();

router.post('/career/add', validation, addOpenning);
router.post('/career/remove/:id', validation, removeOpenning);
router.get('/career', validation, getOpenings);
router.get('/career/:id', validation, getOneOpenning);
router.get('/career/location/:location', validation, locationSearch);
router.get('/career/title/:title', validation, titleSearch);

module.exports = router;
