const User = require('../models/usermodel');
const Student =require('../models/student');
const Branch=require('../models/branch');
const College=require('../models/college')
const CollegeAdmin=require('../models/cAdmin')
const PLACEMENT=require('../models/placement')
const APPLICATIONFORM = require('../models/applicationForm');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const COMPANY = require('../models/companies');

/**
 * Get all students
 */
const getAllStudents = async (req, res) => {
    try {
        let userFilter = { role: 'student' };
        let collegeFilter = {}; // default: no college filter

        if (req.user.role === 'college_admin') {
            const cAdmin = await CollegeAdmin.findOne({ cAdminId: req.user._id });
            if (!cAdmin) {
                return res.status(404).json({ message: 'College not found' });
            }
            collegeFilter.collegeId = cAdmin.collegeId; // apply college filter only for college admin
        }
        if (req.user.role === 'student') {
            const student = await Student.findOne({ studentId: req.user._id });
            if (!student) {
                return res.status(404).json({ message: 'student not found' });
            }
            collegeFilter.collegeId = student.collegeId; // apply college filter only for college admin
        }

        // Step 1: Get student users
        const studentUsers = await User.find(userFilter, {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            technicalInterview: 1,
            hrInterview: 1,
            managerialInterview: 1,
        });

        const userIds = studentUsers.map(user => user._id);

        // Step 2: Get student data with optional college filter
        const students = await Student.find({
            studentId: { $in: userIds },
            ...collegeFilter
        });

        // Step 3: Get all branch names
        const branchIds = students.map(s => s.branchId);
        const branches = await Branch.find({ _id: { $in: branchIds } });
        const branchMap = new Map(branches.map(branch => [branch._id.toString(), branch.branchName]));

        // Step 4: Get all college names
        const collegeIds = students.map(s => s.collegeId);
        const colleges = await College.find({ _id: { $in: collegeIds } }, { _id: 1, name: 1 });
        const collegeMap = new Map(colleges.map(college => [college._id.toString(), college.name]));

        // Step 5: Get all applied company IDs
        const allAppliedCompanyIds = students.flatMap(s => s.appliedCompanies || []);
        const uniqueCompanyIds = [...new Set(allAppliedCompanyIds.map(id => id.toString()))];

        // Step 6: Get all company names
        const companies = await COMPANY.find({ _id: { $in: uniqueCompanyIds } }, { _id: 1, company_name: 1 });
        const companyMap = new Map(companies.map(company => [company._id.toString(), company.company_name]));

        // Step 7: Combine everything
        const combined = studentUsers.map(user => {
            const studentInfo = students.find(s => s.studentId.toString() === user._id.toString());
            if (!studentInfo) return null; // skip users with no student record (filtered by college)

            const branchName = branchMap.get(studentInfo.branchId?.toString()) || 'Unknown';
            const collegeName = collegeMap.get(studentInfo.collegeId?.toString()) || 'Unknown';

            const appliedCompanies = (studentInfo.appliedCompanies || []).map(companyId => ({
                _id: companyId,
                name: companyMap.get(companyId.toString()) || 'Unknown'
            }));

            return {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                technicalInterview: user.technicalInterview || [],
                hrInterview: user.hrInterview || [],
                managerialInterview: user.managerialInterview || [],
                collegeId: studentInfo.collegeId?.toString(),
                college: collegeName,
                rollNo: studentInfo.rollNo,
                year: studentInfo.year || null,
                branch: branchName,
                interest: studentInfo.interest || [],
                cgpa: studentInfo.cgpa || null,
                cap: studentInfo.cap || 0,
                appliedCompanies: appliedCompanies
            };
        }).filter(Boolean); // remove nulls from unmatched users

        return res.status(200).json({ message: "Success", data: combined });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



// async function getAllStudents(req, res) {
//     try {
//         let query = { role: 'student' };
        
//         // If college admin, only show students from their college
//         if (req.user.role === 'college_admin') {
//             query.college = req.user.college;
//         }

//         const students = await User.find(query, {
//             name: 1,
//             email: 1,
//             college: 1,
//             branch: 1,
//             year: 1,
//             specialization: 1,
//             cgpa: 1,
//             interest: 1,
//             interview: 1,
//             createdAt: 1
//         });

//         return res.status(200).json({ 
//             message: "Success", 
//             data: students 
//         });
//     } catch (error) {
//         return res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// }

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
            firstName,
            lastName, 
            email, 
            branch, 
            year, 
            cgpa,
            cap,
            rollNo,
        } = req.body;

        // Check if student exists
        const studentUser = await User.findById(id);
        const student = await Student.findOne({ studentId:id });
        const cAdmin=await CollegeAdmin.findOne({cAdminId:req.user._id})
        if (!studentUser || !student) {
            return res.status(404).json({ message: "Student not found" });
        }
        // Check if college admin is trying to update student from another college
        if (req.user.role === 'college_admin') {
            // console.log(collegeId)
            if (student.collegeId.toString() !== cAdmin.collegeId.toString()) {
                return res.status(403).json({ message: "Access denied. You can only update students from your college" });
            }
        }

        // Update User collection
        const updatedStudent = await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    firstName,
                    lastName,
                    email
                }
            },
            { new: true }
        );

        // Update Student collection
        await Student.findOneAndUpdate(
            { studentId:id },
            {
                $set: {
                    branchId:branch,
                    year,
                    cgpa,
                    cap,
                    rollNo
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
        const student = await Student.findOne({ studentId: req.user._id });
        if (!student) {
            return res.status(404).json({ message: "Student Not Found" });
        }

        const collegeId = student.collegeId;
        if (!collegeId) {
            return res.status(400).json({ message: "College information missing for student" });
        }
        const APPLICATIONFORM = require('../models/applicationForm');
        // Find all applications for the student's college where the student is in the applied list
        const applications = await APPLICATIONFORM.find({
            collegeId: collegeId,
            studentsApplied: req.user._id
        }).populate([
            {
                path: 'companytoCollegeId',
                populate: {
                    path: 'companyId',
                    model: 'company'
                }
            }
        ]); // populate company details

        const formattedDrives = applications.map(app => {
            const ctc = app.companytoCollegeId;
            const company = ctc?.companyId;
            return {
                _id:app._id,
                company_name: company?.company_name || "N/A",
                visit_date: ctc?.visitDate,
                location: ctc?.location || "On Campus",
                role: ctc?.role || "N/A",
                package_lpa: ctc?.package_lpa?.toString() || "N/A",
                eligibility: {
                    minCgpa: ctc?.minCgpa?.toString() || "N/A",
                    allowedBranches: ctc?.allowedBranches || [],
                    allowedYears: ctc?.allowedYear || []
                },
                applicationDeadline: ctc?.applicationDeadline || "N/A"
            };
        });


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
        let college_id;
        
    if(req.user.role==='student'){
        const student=await Student.findOne({studentId:req.user._id})
        if (!student) {
            return res.status(404).json({ message: 'student not found' });
        }
        college_id = student.collegeId;
    }
    const query = {};

      query.studentId = req.user._id;
      query.collegeId = college_id;
        const placements = await PLACEMENT.find(query)
            .populate({
                path:'studentId',
                select:'firstName lastName'
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
            // const companyToCollege = await COMPANYTOCOLLEGE.findOne({
            //     companyId: placement.companyId._id,
            //     collegeId: college_id
            // });

            return {
                placement_id: placement._id,
                company_id: placement.companyId._id,
                company_name: placement.companyId.company_name,
                student_name: `${placement.studentId.firstName} ${placement.studentId.lastName}`,
                student_id: placement.studentId,
                collegeId: placement.collegeId._id,
                collegeName: placement.collegeId.name,
                package_lpa: placement.package_lpa || 0,
                placement_date: placement.createdAt
            };
        }));
        return res.status(200).json({
            message: "Recent placements retrieved successfully",
            data: formattedPlacements
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

async function getApplicationDetail(req,res){
    try{
    const {id}=req.params;
    const application=await APPLICATIONFORM.findById(id)
    .populate([
        {
            path: 'companytoCollegeId',
            populate: {
                path: 'companyId',
                model: 'company'
            }
        }
    ]);


    return res.status(200).json({
        message: "Success",
        data: application
    });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}


module.exports = {
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getUpcomingDrives,
    getRecentPlacements,
    getApplicationDetail
};