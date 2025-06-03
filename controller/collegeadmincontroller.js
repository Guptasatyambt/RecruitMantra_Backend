const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const COMPANY = require('../models/companies');
const PLACEMENT = require('../models/placement');
const COMPANYTOCOLLEGE = require('../models/companyToCollege');
const Student = require('../models/student');

const markStudentsHired = async (req, res) => {
    try {
        const { student_ids, company_id } = req.body;
        
        // Validate input
        if (!Array.isArray(student_ids) || !company_id) {
            return res.status(400).json({ message: 'Invalid request data' });
        }
        
        // Find company and verify it exists
        const company = await COMPANY.findById(company_id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        
        // Find the companyToCollege record
        const companyToCollege = await COMPANYTOCOLLEGE.findOne({
            companyId: company_id,
            collegeId: req.user.college
        });
        
        if (!companyToCollege) {
            return res.status(404).json({ message: 'Company not associated with this college or unauthorized' });
        }
        
        // Create placement records for each student
        const placementPromises = student_ids.map(async (studentId) => {
            // Check if placement already exists
            const existingPlacement = await PLACEMENT.findOne({
                studentId,
                companyId: company_id,
                collegeId: req.user.college
            });
            
            if (!existingPlacement) {
                // Create new placement record
                const placement = new PLACEMENT({
                    studentId,
                    companyId: company_id,
                    collegeId: req.user.college
                });
                
                const savedPlacement = await placement.save();
                return savedPlacement._id;
            }
            
            return existingPlacement._id;
        });
        
        // Wait for all placement records to be created
        const placementIds = await Promise.all(placementPromises);
        
        // Update companyToCollege with placement IDs
        // Use Set to ensure uniqueness
        const existingPlaceIds = companyToCollege.placeId || [];
        companyToCollege.placeId = [...new Set([...existingPlaceIds, ...placementIds])];
        
        await companyToCollege.save();
        
        res.status(200).json({ 
            message: 'Students marked as hired successfully',
            placements_count: placementIds.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Add multiple students in bulk (by college admin)
 */
async function addStudentsBulk(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const studentsData = req.body;
        
        if (!Array.isArray(studentsData)) {
            return res.status(400).json({ message: "Input should be an array of student objects" });
        }

        const validationErrors = [];
        const studentsToCreate = [];
        const defaultPassword = "12345";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        for (const studentData of studentsData) {
            const { 
                firstName,
                lastName, 
                email, 
                branch, 
                cgpa,
                year,
            } = studentData;

            if (!firstName || !lastName || !email || !branch || !year || !cgpa) {
                validationErrors.push({ 
                    email: email || 'missing', 
                    error: "Missing required fields (name, email, branch, cgpa, year)" 
                });
                continue;
            }

            const existingUser = await User.findOne({ email }).session(session);
            if (existingUser) {
                validationErrors.push({ 
                    email, 
                    error: "Student with this email already exists" 
                });
                continue;
            }

            const user = await User.create([{
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: 'student',
                profileimage: "",
                technicalInterview: [],
                hrInterview: [],
                managerialInterview: [],
                seriesInterview: []
            }], { session });

            await Student.create([{
                studentId: user[0]._id,
                collegeId: req.user.college,
                branchId: branch,
                year,
                cgpa,
                coins: 100,
                cap: 0
            }], { session });

            studentsToCreate.push(user[0]);
        }

        if (validationErrors.length > 0) {
            await session.abortTransaction();
            return res.status(400).json({ 
                message: "Some students had validation errors", 
                errors: validationErrors,
                successCount: studentsToCreate.length
            });
        }

        await session.commitTransaction();

        // Send email notifications
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        for (const student of studentsToCreate) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.email,
                subject: 'Your RecruitMantra Account',
                html: `
                    <h2>Welcome to RecruitMantra!</h2>
                    <p>Dear ${student.firstName} ${student.lastName},</p>
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
            data: studentsToCreate.map(s => ({ id: s._id, name: `${s.firstName} ${s.lastName}`, email: s.email }))
        });
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
        session.endSession();
    }
}

async function addSingleStudent(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const studentData = req.body;
        const defaultPassword = "12345";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        if (!studentData.firstName || !studentData.lastName || !studentData.email || !studentData.branch || !studentData.year || !studentData.cgpa) {
            return res.status(400).json({ 
                message: "Missing required fields (name, email, branch, year, cgpa)" 
            });
        }

        const existingUser = await User.findOne({ email: studentData.email }).session(session);
        if (existingUser) {
            return res.status(400).json({ 
                message: "Student with this email already exists" 
            });
        }

        const user = await User.create([{
            firstName,
            lastName,
            email: studentData.email,
            password: hashedPassword,
            role: 'student',
            profileimage: "",
            technicalInterview: [],
            hrInterview: [],
            managerialInterview: [],
            seriesInterview: []
        }], { session });

        await Student.create([{
            studentId: user[0]._id,
            collegeId: req.user.college,
            branchId: studentData.branch,
            year: studentData.year,
            cgpa: studentData.cgpa,
            coins: 100,
            cap: 0
        }], { session });

        await session.commitTransaction();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user[0].email,
            subject: 'Your RecruitMantra Account',
            html: `
                <h2>Welcome to RecruitMantra!</h2>
                <p>Dear ${user[0].firstName} ${user[0].lastName},</p>
                <p>An account has been created for you on the RecruitMantra platform.</p>
                <p>Your login details:</p>
                <ul>
                    <li><strong>Email:</strong> ${user[0].email}</li>
                    <li><strong>Password:</strong> ${defaultPassword}</li>
                </ul>
                <p>Please log in and change your password as soon as possible.</p>
                <p>Best regards,<br>RecruitMantra Team</p>
            `
        };

        transporter.sendMail(mailOptions).catch(err => {
            console.error(`Failed to send email to ${user[0].email}:`, err);
        });

        return res.status(201).json({ 
            message: "Student added successfully", 
            data: {
                id: user[0]._id,
                name: `${user[0].firstName} ${user[0].lastName}`,
                email: user[0].email
            }
        });
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
        session.endSession();
    }
}

async function getRecentPlacements(req, res) {
    try {
        const college_id = req.user.college;
        
        const placements = await PLACEMENT.find({ collegeId: college_id })
            .populate({
                path: 'studentId',
                select: 'firstName lastName email'
            })
            .populate({
                path: 'companyId',
                select: 'company_name'
            })
            .populate({
                path: 'collegeId',
                select: 'name'
            })
            .sort({ createdAt: -1 });

        const formattedPlacements = await Promise.all(placements.map(async (placement) => {
            const companyToCollege = await COMPANYTOCOLLEGE.findOne({
                companyId: placement.companyId._id,
                collegeId: college_id
            });

            return {
                placement_id: placement._id,
                company_id: placement.companyId._id,
                company_name: placement.companyId.company_name,
                student_name: `${placement.studentId.firstName} ${placement.studentId.lastName}`,
                student_email: placement.studentId.email,
                role: companyToCollege?.role || 'Not specified',
                package_lpa: companyToCollege?.package_lpa || 0,
                placement_date: placement.createdAt
            };
        }));
        
        return res.status(200).json({
            message: "Recent placements retrieved successfully",
            data: formattedPlacements
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