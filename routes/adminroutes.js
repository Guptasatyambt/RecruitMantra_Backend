const express = require('express');
const {
    approveCollegeAdmin
} = require('../controller/admincontroller');
const { validation, isAdmin } = require('../service/auth');
const router = express.Router();

// router.post('/get-admin-dashboard-stats', validation, isAdmin, getAdminDashboardStats)
router.post('/approve-college-admin', validation, isAdmin, approveCollegeAdmin);

module.exports = router;
