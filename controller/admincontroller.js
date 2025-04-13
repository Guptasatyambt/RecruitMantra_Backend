const Company = require('../models/companies');
const nodemailer = require('nodemailer');
const User = require('../models/usermodel');

// Approve or reject college admin
async function approveCollegeAdmin(req, res) {
    try {
        const { adminId, approved } = req.body;
        
        // Only super admin can approve college admins
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Access denied. Super admin privileges required" });
        }
        
        const collegeAdmin = await User.findById(adminId);
        if (!collegeAdmin || collegeAdmin.role !== 'college_admin') {
            return res.status(404).json({ message: "College admin not found" });
        }
        
        collegeAdmin.isApproved = approved;
        await collegeAdmin.save();
        
        // Send email notification to college admin
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: collegeAdmin.email,
            subject: approved ? 'Your College Admin Account has been Approved' : 'Your College Admin Account Request',
            html: approved ? `
                <h2>Account Approved</h2>
                <p>Dear ${collegeAdmin.name},</p>
                <p>Your college admin account for ${collegeAdmin.college} has been approved. You can now log in and manage students from your college.</p>
                <p>Best regards,<br>RecruitMantra Team</p>
            ` : `
                <h2>Account Not Approved</h2>
                <p>Dear ${collegeAdmin.name},</p>
                <p>We regret to inform you that your college admin account request for ${collegeAdmin.college} has not been approved at this time.</p>
                <p>Please contact our support team for more information.</p>
                <p>Best regards,<br>RecruitMantra Team</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({
            message: approved ? "College admin approved successfully" : "College admin rejected",
            data: { id: collegeAdmin._id, name: collegeAdmin.name, email: collegeAdmin.email }
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
// Approve or reject college admin
async function getAdminDashboardStats(req, res) {
    try {
        const { adminId, approved } = req.body;
        
        // Only super admin can approve college admins
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Access denied. Super admin privileges required" });
        }
        
        const collegeAdmin = await User.findById(adminId);
        if (!collegeAdmin || collegeAdmin.role !== 'college_admin') {
            return res.status(404).json({ message: "College admin not found" });
        }
        
        collegeAdmin.isApproved = approved;
        await collegeAdmin.save();
        
        // Send email notification to college admin
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: collegeAdmin.email,
            subject: approved ? 'Your College Admin Account has been Approved' : 'Your College Admin Account Request',
            html: approved ? `
                <h2>Account Approved</h2>
                <p>Dear ${collegeAdmin.name},</p>
                <p>Your college admin account for ${collegeAdmin.college} has been approved. You can now log in and manage students from your college.</p>
                <p>Best regards,<br>RecruitMantra Team</p>
            ` : `
                <h2>Account Not Approved</h2>
                <p>Dear ${collegeAdmin.name},</p>
                <p>We regret to inform you that your college admin account request for ${collegeAdmin.college} has not been approved at this time.</p>
                <p>Please contact our support team for more information.</p>
                <p>Best regards,<br>RecruitMantra Team</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({
            message: approved ? "College admin approved successfully" : "College admin rejected",
            data: { id: collegeAdmin._id, name: collegeAdmin.name, email: collegeAdmin.email }
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
module.exports = {
    approveCollegeAdmin,
    getAdminDashboardStats
};