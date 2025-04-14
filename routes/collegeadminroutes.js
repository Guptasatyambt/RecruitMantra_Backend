const express = require('express');
const { addStudentsBulk, markStudentsHired, addSingleStudent, getRecentPlacements } = require('../controller/collegeadmincontroller');
const { validation, isCollegeAdmin } = require('../service/auth');
const router = express.Router();

router.post('/students/bulk', validation, isCollegeAdmin, addStudentsBulk);
router.post('/student/add', validation, isCollegeAdmin, addSingleStudent);
router.post('/mark-hired', validation, isCollegeAdmin, markStudentsHired);
router.get('/recent-placements', validation, isCollegeAdmin, getRecentPlacements);

module.exports = router;