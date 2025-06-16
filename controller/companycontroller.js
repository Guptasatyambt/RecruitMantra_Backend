const Company = require('../models/companies');
const nodemailer = require('nodemailer');
const User = require('../models/usermodel');
const CADMIN = require('../models/cAdmin');
const STUDENT = require('../models/student');
const DEFAULTUSER = require('../models/defaultUser');
const COMPANYTOCOLLEGE = require('../models/companyToCollege')
const COLLEGE = require('../models/college');
const APPLIED = require('../models/applicationForm');
const Student=require('../models/student');
const { isCollegeAdmin } = require('../service/auth');


async function addCompany(req, res) {
    try {
        const {
            company_name,
            industry
        } = req.body;

        // Validate required fields
        const companyExists=await Company.findOne({company_name:company_name})
        if(companyExists){
            return res.status(200).json({ message: "Company Exist", data: companyExists }); 
        }

        if (!company_name ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const company = await Company.create({
            company_name,
            industry
        });
        return res.status(200).json({ message: "Company added successfully", data: company });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function addCompanyToCollege(req, res) {
    try {
        const {
            companyId,
            collegeId,
            location,
            package,
            stipendDetails,
            role,
            jobDescription,
            visitDate,
            applicationDeadline,
            minCgpa,
            allowedBranches,
            allowedYear
        } = req.body;

        // Validate required fields
        if (!companyId || !collegeId || !location || !package || !stipendDetails || !role || !jobDescription || !applicationDeadline || !minCgpa || !allowedBranches || !allowedYear) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if company exists in the Company model
        const companyExists = await Company.findById(companyId);
        if (!companyExists) {
            return res.status(404).json({ message: "Company not found" });
        }

        // Create a record in CompanyToCollege model
        const companyToCollege = await COMPANYTOCOLLEGE.create({
            companyId,
            collegeId: collegeId,
            location,
            package_lpa: package,
            stipendDetails,
            role,
            jobDescription,
            visitDate: visitDate,
            applicationDeadline,
            minCgpa,
            allowedBranches,
            allowedYear,
            placeId: []
        });

        // Find eligible students (using Student model)
        const eligibleStudents = await STUDENT.find({
            collegeId: collegeId,
            year: { $in: allowedYear },
            branchId: { $in: allowedBranches },
            cgpa: { $gte: minCgpa }
        }).populate('studentId');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        for (const student of eligibleStudents) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.studentId.email,
                subject: `New Job Opportunity: ${companyExists.company_name} is Hiring!`,
                html: `
                    <h2>New Campus Recruitment Opportunity</h2>
                    <p>Dear ${student.studentId.firstName} ${student.studentId.lastName},</p>
                    <p>We're excited to inform you that ${companyExists.company_name} is visiting our campus for recruitment!</p>
                    
                    <h3>Job Details:</h3>
                    <ul>
                        <li><strong>Position:</strong> ${role}</li>
                        <li><strong>Package:</strong> ${package}</li>
                        <li><strong>Visit Date:</strong> ${new Date(companyToCollege.visitDate).toLocaleDateString()}</li>
                        <li><strong>Application Deadline:</strong> ${new Date(applicationDeadline).toLocaleDateString()}</li>
                    </ul>

                    <p>Please log in to your account for more details and to apply.</p>

                    <p>Best regards,<br>Campus Recruitment Team</p>
                `
            };

            await transporter.sendMail(mailOptions);
        }

        return res.status(201).json({ message: "Company added to college successfully", data: companyToCollege });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function updateCompany(req, res) {
    try {
        const { company_id } = req.params;
        const updateData = req.body;

        const company = await Company.findByIdAndUpdate(
            company_id,
            { $set: updateData },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        return res.status(200).json({ message: "Company updated successfully", data: company });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}
async function getCompanyDetails(req, res) {
    try {
        const { company_id } = req.params;
        const company = await Company.findById(company_id);

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        return res.status(200).json({ message: "Success", data: company });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function getCompaniesComingToCollege(req, res) {
  try {
    let college_id;
        if(req.user.role==='college_admin'){
        const cAdmin=await CADMIN.findOne({cAdminId:req.user._id})
        if (!cAdmin) {
            return res.status(404).json({ message: 'college not found' });
        }
         college_id = cAdmin.collegeId;
    }
    if(req.user.role==='student'){
        const student=await Student.findOne({studentId:req.user._id})
        if (!student) {
            return res.status(404).json({ message: 'student not found' });
        }
        college_id = student.collegeId;
    }
    const query = {};

    if (college_id) {
      query.collegeId = college_id;
    }

    const companies = await COMPANYTOCOLLEGE.find(query)
      .populate({
        path: 'companyId',
        select: 'company_name industry',
      })
      .populate({
        path: 'collegeId',
        select: 'name',
      })
      .populate({
        path: 'allowedBranches',
        select: 'branchName _id',
      })
      .populate({
        path: 'placeId',
        populate: {
          path: 'studentId',
          select: 'firstName lastName',
          model: 'user',
        },
      })
      .sort({ visitDate: 1 });
    //   const application=await APPLIED.findOne({companyId:company_id,collegeId:collegeId})
    const placedStudentIds = [];
    const placedStudentNames = [];

    const formatted = companies.map((entry) => {
      // Extract placed student IDs and names
      if (entry.placeId && entry.placeId.studentId) {
        placedStudentIds.push(entry.placeId.studentId._id.toString());
        placedStudentNames.push(`${entry.placeId.studentId.firstName} ${entry.placeId.studentId.lastName}`);
      }

      return {
        _id: entry._id,
        companyId: entry.companyId?._id || null,
        companyName: entry.companyId?.company_name || 'Unknown',
        industry: entry.companyId?.industry || 'Unknown',
        collegeName: entry.collegeId?.name || 'Unknown',
        contactEmail: entry.contact_email,
        contactPhone: entry.contact_phone,
        location: entry.location,
        role: entry.role,
        packageLPA: entry.package_lpa?.toString() || null,
        stipendDetails: entry.stipendDetails,
        jobDescription: entry.jobDescription,
        visitDate: entry.visitDate,
        applicationDeadline: entry.applicationDeadline,
        minCgpa: entry.minCgpa?.toString() || null,
        branches:entry.allowedBranches.map(branch => branch._id),
        allowedBranches: entry.allowedBranches.map(branch => branch.branchName),
        allowedYear: entry.allowedYear,
        placeId: entry.placeId,
        createdAt:entry.createdAt
      };
    });
    return res.status(200).json({
      message: "Success",
      data: formatted,
      placedStudentIds,
      placedStudentNames
    });

  } catch (e) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: e.message
    });
  }
}
async function getCompanytoCollegeDetails(req, res) {
    try {
        const { company_id } = req.params;
        const company = await COMPANYTOCOLLEGE.findOne({companyId:company_id})
            .populate({
                path: 'companyId',
                select: 'company_name'
            })
            .populate({
                path: 'allowedBranches',
                select: 'branchName'
            });

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        return res.status(200).json({ message: "Success", data: company });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}


async function updateCompanyToCollege(req, res) {
    try {
        const { _id } = req.params;
        const cAdmin=await CADMIN.findOne({cAdminId:req.user._id});
        if(!cAdmin){
             return res.status(400).json({ message: "You are not authorized to update company" });
        }
        const updateData = req.body;
       
        const c=await COMPANYTOCOLLEGE.findById(_id);
        const companyToCollege = await COMPANYTOCOLLEGE.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { new: true }
        );
        

        return res.status(200).json({ message: "Company updated successfully", data: companyToCollege });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}
async function getAllCompanies(req, res) {
    try {
        const allCompanies = await Company.find();
        return res.status(200).json({message:"Success",data:allCompanies})
    }
    catch(e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function updateHiringStatus(req, res) {
    try {
        const { company_id } = req.params;
        const { status, students_hired } = req.body;

        if (!['upcoming', 'ongoing', 'completed'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const company = await Company.findByIdAndUpdate(
            company_id,
            {
                $set: {
                    status,
                    ...(students_hired && { students_hired })
                }
            },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        return res.status(200).json({ message: "Status updated successfully", data: company });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function getEligibleCompanies(req, res) {
    try {
        const user = req.user;
        const student = await User.findOne({ email: user.email });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const eligibleCompanies = await Company.find({
            status: { $in: ['upcoming', 'ongoing'] },
            'eligibility_criteria.allowed_batch_year': student.year,
            'eligibility_criteria.allowed_branches': student.branch
        }).sort({ visit_date: 1 });

        return res.status(200).json({ message: "Success", data: eligibleCompanies });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function deleteCompany(req, res) {
    try {
        const { company_id } = req.params;
        const company = await Company.findByIdAndDelete(company_id);

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        return res.status(200).json({ message: "Company deleted successfully" });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function applyCompanyToCollege(req, res) {
    try {
        const  {company_id}  = req.params;
        const userId = req.user._id;
        // 1. Find the student and verify existence
        const student = await Student.findOne({ studentId: userId });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // 2. Find the company-college mapping (or companyId directly if you store like that)
        const companyToCollege = await COMPANYTOCOLLEGE.findOne({ companyId: company_id, collegeId: student.collegeId });
        if (!companyToCollege) {
            return res.status(404).json({ message: "Company not available for your college" });
        }

        // 3. Check if an application record already exists for the company-college pair
        let application = await APPLIED.findOne({
            companyId: company_id,
            collegeId: student.collegeId,
            companytoCollegeId:companyToCollege.id
        });

        if (application) {
            // 4. Check if student already applied
            if (application.studentsApplied.includes(userId)) {
                return res.status(400).json({ message: "You have already applied for this company" });
            }

            // 5. Push student to existing studentsApplied array
            application.studentsApplied.push(userId);
            await application.save();
            
        } else {
            // 6. Create new application entry if it doesn't exist
            application = new APPLIED({
                collegeId: student.collegeId,
                companyId: company_id,
                studentsApplied: [userId],
                companytoCollegeId:companyToCollege.id
            });
            await application.save();
        }
        const appliedCompanies=student.appliedCompanies;
            appliedCompanies.push(company_id)
            await Student.findByIdAndUpdate(student._id,
                {
                    $set: {
                        appliedCompanies:appliedCompanies
                    }
                },
                { new: true }
            )

        return res.status(200).json({ message: "Application submitted successfully" });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}


module.exports = {
    addCompany,
    addCompanyToCollege,
    updateCompany,
    getCompanyDetails,
    getAllCompanies,
    updateHiringStatus,
    getEligibleCompanies,
    deleteCompany,
    getCompaniesComingToCollege,
    updateCompanyToCollege,
    getCompanytoCollegeDetails,
    applyCompanyToCollege
};