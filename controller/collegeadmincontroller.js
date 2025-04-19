const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const COMPANY = require('../models/companies');

const markStudentsHired = async (req, res) => {
    try {
        const { student_ids, company_id } = req.body;
        
        // Validate input
        if (!Array.isArray(student_ids) || !company_id) {
            return res.status(400).json({ message: 'Invalid request data' });
        }
        
        // Find company and verify it belongs to admin's college
        const company = await COMPANY.findById(company_id);
        if (!company || company._id.toString() !== req.user.college.toString()) {
            return res.status(404).json({ message: 'Company not found or unauthorized' });
        }
        
        // Update company with hired students
        company.hired_students = [...new Set([...company.hired_students, ...student_ids])];
        company.students_hired = company.hired_students.length;
        // await company.save();
        
        res.status(200).json({ message: 'Students marked as hired successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Add multiple students in bulk (by college admin)
 */
async function addStudentsBulk(req, res) {
    try {
        const studentsData = req.body;
        
        // Validate input is an array
        if (!Array.isArray(studentsData)) {
            return res.status(400).json({ message: "Input should be an array of student objects" });
        }

        // Validate each student object
        const validationErrors = [];
        const studentsToCreate = [];
        const defaultPassword = "12345";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        for (const studentData of studentsData) {
            const { 
                name, 
                email, 
                branch, 
                cgpa,
                year, 
                specialization, 
                interest 
            } = studentData;

            // Validate required fields
            if (!name || !email || !branch || !year || !cgpa) {
                validationErrors.push({ 
                    email: email || 'missing', 
                    error: "Missing required fields (name, email, branch, cgpa, year)" 
                });
                continue;
            }

            // Check if student already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                validationErrors.push({ 
                    email, 
                    error: "Student with this email already exists" 
                });
                continue;
            }

            studentsToCreate.push({
                name,
                email,
                password: hashedPassword,
                role: 'student',
                college: req.user.college, // Enforce admin's college
                branch,
                cgpa,
                year,
                specialization: specialization || "",
                interest: interest || "",
                profileimage: "",
                resume: "",
                interview: []
            });
        }

        // If any validation errors, return them
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                message: "Some students had validation errors", 
                errors: validationErrors,
                successCount: studentsToCreate.length
            });
        }

        // Create all valid students
        const createdStudents = await User.insertMany(studentsToCreate);

        // Send email notifications (in background, don't wait for completion)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        for (const student of createdStudents) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.email,
                subject: 'Your RecruitMantra Account',
                html: `
                    <h2>Welcome to RecruitMantra!</h2>
                    <p>Dear ${student.name},</p>
                    <p>An account has been created for you on the RecruitMantra platform.</p>
                    <p>Your login details:</p>
                    <ul>
                        <li><strong>Email:</strong> ${student.email}</li>
                        <li><strong>Password:</strong> ${defaultPassword}</li>
                    </ul>
                    <p>Please log in and change your password as soon as possible.</p>
                    <p>Best regards,<br>RecruitMantra Team</p>
                `
            };

            transporter.sendMail(mailOptions).catch(err => {
                console.error(`Failed to send email to ${student.email}:`, err);
            });
        }

        return res.status(201).json({ 
            message: "Students added successfully", 
            data: createdStudents.map(s => ({ id: s._id, name: s.name, email: s.email }))
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

async function addSingleStudent(req, res) {
    try {
        const studentData = req.body;
        const defaultPassword = "12345";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Validate required fields
        if (!studentData.name || !studentData.email || !studentData.branch || !studentData.year || !studentData.cgpa) {
            return res.status(400).json({ 
                message: "Missing required fields (name, email, branch, year)" 
            });
        }

        // Check if student already exists
        const existingUser = await User.findOne({ email: studentData.email });
        if (existingUser) {
            return res.status(400).json({ 
                message: "Student with this email already exists" 
            });
        }

        // Create student
        const newStudent = new User({
            name: studentData.name,
            email: studentData.email,
            password: hashedPassword,
            role: 'student',
            college: req.user.college,
            branch: studentData.branch,
            cgpa: studentData.cgpa,
            year: studentData.year,
            specialization: studentData.specialization || "",
            interest: studentData.interest || "",
            profileimage: "",
            resume: "",
            interview: []
        });

        const createdStudent = await newStudent.save();

        // Send email notification
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: createdStudent.email,
            subject: 'Your RecruitMantra Account',
            html: `
                <h2>Welcome to RecruitMantra!</h2>
                <p>Dear ${createdStudent.name},</p>
                <p>An account has been created for you on the RecruitMantra platform.</p>
                <p>Your login details:</p>
                <ul>
                    <li><strong>Email:</strong> ${createdStudent.email}</li>
                    <li><strong>Password:</strong> ${defaultPassword}</li>
                </ul>
                <p>Please log in and change your password as soon as possible.</p>
                <p>Best regards,<br>RecruitMantra Team</p>
            `
        };

        transporter.sendMail(mailOptions).catch(err => {
            console.error(`Failed to send email to ${createdStudent.email}:`, err);
        });

        return res.status(201).json({ 
            message: "Student added successfully", 
            data: {
                id: createdStudent._id,
                name: createdStudent.name,
                email: createdStudent.email
            }
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
    addStudentsBulk,
    markStudentsHired,
    addSingleStudent,
    getRecentPlacements
};