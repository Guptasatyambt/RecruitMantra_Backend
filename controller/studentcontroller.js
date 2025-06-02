const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const COMPANY = require('../models/companies');

/**
 * Get all students
 */
async function getAllStudents(req, res) {
    try {
        let query = { role: 'student' };
        
        // If college admin, only show students from their college
        if (req.user.role === 'college_admin') {
            query.college = req.user.college;
        }

        const students = await User.find(query, {
            name: 1,
            email: 1,
            college: 1,
            branch: 1,
            year: 1,
            specialization: 1,
            cgpa: 1,
            interest: 1,
            interview: 1,
            createdAt: 1
        });

        return res.status(200).json({ 
            message: "Success", 
            data: students 
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

/**
 * Get student by ID
 */
async function getStudentById(req, res) {
    try {
        const { id } = req.params;
        
        // Find the student
        const student = await User.findById(id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if college admin is trying to access student from another college
        if (req.user.role === 'college_admin' && student.college.toString() !== req.user.college.toString()) {
            return res.status(403).json({ message: "Access denied. You can only view students from your college" });
        }

        return res.status(200).json({ 
            message: "Success", 
            data: student 
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

/**
 * Update student
 */
async function updateStudent(req, res) {
    try {
        const { id } = req.params;
        const { 
            name, 
            email, 
            branch, 
            year, 
            college, 
            specialization, 
            interest 
        } = req.body;

        // Validate required fields
        if (!name || !email || !branch || !year || !college) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // Check if student exists
        const student = await User.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if college admin is trying to update student from another college
        if (req.user.role === 'college_admin') {
            if (student.college.toString() !== req.user.college.toString()) {
                return res.status(403).json({ message: "Access denied. You can only update students from your college" });
            }
            // Enforce college admin's college
            college = req.user.college;
        }

        // Update student
        const updatedStudent = await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    name,
                    email,
                    college,
                    branch,
                    year,
                    specialization: specialization || "",
                    interest: interest || ""
                }
            },
            { new: true }
        );

        return res.status(200).json({ 
            message: "Student updated successfully", 
            data: updatedStudent 
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

/**
 * Delete student
 */
async function deleteStudent(req, res) {
    try {
        const { id } = req.params;
        
        // Check if student exists
        const student = await User.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if college admin is trying to delete student from another college
        if (req.user.role === 'college_admin' && student.college !== req.user.college) {
            return res.status(403).json({ message: "Access denied. You can only delete students from your college" });
        }

        // Delete student
        await User.findByIdAndDelete(id);

        return res.status(200).json({ 
            message: "Student deleted successfully" 
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

/**
 * Get upcoming drives for student's college
 */
async function getUpcomingDrives(req, res) {
    try {
        const { college } = req.query;
        
        // Validate college parameter
        if (!college) {
            return res.status(400).json({ message: "College parameter is required" });
        }

        // Import the Company model
        const Company = require('../models/companies');
        
        // Find upcoming drives for the specified college
        // We need to find the college ID first or use the college directly depending on the data structure
        const upcomingDrives = await Company.find({
            status: 'upcoming',
            $or: [
                { college_id: college }, // If college is stored as ID
                { 'college': college }    // If college is stored as string
            ]
        }).sort({ visit_date: 1 });

        // Format the response
        const formattedDrives = upcomingDrives.map(drive => ({
            company_name: drive.company_name,
            visit_date: drive.visit_date,
            location: 'On Campus', // Default location
            position: drive.position,
            package_lpa: drive.package_lpa,
            eligibility: drive.eligibility_criteria
        }));

        return res.status(200).json({ 
            message: "Success", 
            data: formattedDrives 
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

async function getRecentPlacements(req, res) {
    try {
        // Get college_id from the authenticated college admin
        const college_id = req.user.college;
        // Find companies associated with this college that have hired students
        const companies = await COMPANY.find({
            college_id: college_id,
            hired_students: { $exists: true, $not: { $size: 0 } }
        }).populate({
            path: 'hired_students',
            select: 'name email branch year specialization'
        }).sort({ updatedAt: -1 });
        // Format the response data
        const placements = companies.map(company => ({
            company_id: company._id,
            company_name: company.company_name,
            position: company.position,
            package_lpa: company.package_lpa,
            visit_date: company.visit_date,
            students_hired: company.students_hired,
            hired_students: company.hired_students
        }));
        
        return res.status(200).json({
            message: "Recent placements retrieved successfully",
            data: placements
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}


module.exports = {
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getUpcomingDrives,
    getRecentPlacements
};