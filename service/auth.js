const jwt = require("jsonwebtoken")
const CADMIN = require('../models/cAdmin');
const STUDENT = require('../models/student');
const DEFAULTUSER = require('../models/defaultUser');
const asyncHandler = require('express-async-handler')
function setuser(user) {
    return jwt.sign({
        _id: user._id,
        email: user.email,
        role: user.role
    }, process.env.secret)
}

function getUser(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.secret);
    } catch (error) {
        return null;
    }

}



const validation = asyncHandler(async (req, res, next) => {
    let token;
    let authheader = req.headers.Authorization || req.headers.authorization
    if (authheader && authheader.startsWith("Bearer")) {
        token = authheader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorised User || No token available" });
        }
        jwt.verify(token, process.env.secret, async(err, decode) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorised User", error:err});
            }
            req.user = decode;
            
            var collegeId
            if (req.user.role == "college_admin") {
                const details = await CADMIN.findOne({ cAdminId: req.user._id });
                collegeId = details.collegeId
            }
            else if (req.user.role == "student") {
                const details = await STUDENT.findOne({ studentId: req.user._id });
                collegeId = details.collegeId
            }
            else if (req.user.role == "default") {
                const details = await DEFAULTUSER.findOne({ defaultUserId: req.user._id });
                collegeId = details.collegeId
            }

            req.user.college = collegeId
            next();

        })

    }
    else
        res.status(400).json("Invalid token");
});

// Middleware to check if user is approved
const isApproved = asyncHandler(async (req, res, next) => {
    if (!req.user.isApproved) {
        return res.status(403).json({ message: "Your account is pending approval" });
    }
    next();
});

// Middleware to check if user is a super admin
const isSuperAdmin = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied. Super admin privileges required" });
    }
    next();
});

// Middleware to check if user is a college admin
const isCollegeAdmin = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'college_admin') {
        return res.status(403).json({ message: "Access denied. College admin privileges required" });
    }
    next();
});

// Middleware to check if user is either a super admin or an approved college admin
const isAdmin = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'super_admin' && (req.user.role !== 'college_admin' || !req.user.isApproved)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required" });
    }
    next();
});

module.exports = {
    setuser, getUser, validation, isApproved, isSuperAdmin, isCollegeAdmin, isAdmin
}