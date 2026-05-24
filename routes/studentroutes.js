const express = require('express');
const { getAllStudents, getStudentById, updateStudent, deleteStudent, getUpcomingDrives, getRecentPlacements } = require('../controller/studentcontroller');
const { validation } = require('../service/auth');
const router = express.Router();

// Admin routes for student management
router.get('/all', validation, getAllStudents);
router.get('/upcoming-drives', validation, getUpcomingDrives);
router.get('/recent-placements', validation, getRecentPlacements);
router.get('/:id', validation, getStudentById);
router.put('/update/:id', validation, updateStudent);
router.delete('/delete/:id', validation, deleteStudent);


module.exports = router;