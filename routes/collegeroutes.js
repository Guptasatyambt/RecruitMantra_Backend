const express = require('express');
const router = express.Router();
const collegeController = require('../controller/collegecontroller');
const { validation, isSuperAdmin } = require('../service/auth');

router.post('/', validation, isSuperAdmin, collegeController.createCollege);
router.get('/', collegeController.getColleges);
router.get('/:id', validation, isSuperAdmin, collegeController.getCollegeById);
router.put('/:id', validation, isSuperAdmin, collegeController.updateCollege);
router.delete('/:id', validation, isSuperAdmin, collegeController.deleteCollege);

module.exports = router;