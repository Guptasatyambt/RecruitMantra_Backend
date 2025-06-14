const Company = require('../models/companies');
const nodemailer = require('nodemailer');
const User = require('../models/usermodel');
const CADMIN = require('../models/cAdmin');
const STUDENT = require('../models/student');
const DEFAULTUSER = require('../models/defaultUser');
const COMPANYTOCOLLEGE = require('../models/companyToCollege')
const COLLEGE = require('../models/college');

async function addCompany(req, res) {
    try {
        const {
            company_name,
            industry
        } = req.body;

        // Validate required fields
        if (!company_name || !industry) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const company = await Company.create({
            company_name,
            industry
        });
        return res.status(201).json({ message: "Company added successfully", data: company });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function addCompanyToCollege(req, res) {
    try {
        const {
            companyId,
            contact_phone,
            contact_email,
            location,
            package,
            stipendDetails,
            role,
            jobDescription,
            applicationDeadline,
            minCgpa,
            allowedBranches,
            allowedYear
        } = req.body;

        // Validate required fields
        if (!companyId || !contact_phone || !contact_email || !location || !package || !stipendDetails || !role || !jobDescription || !applicationDeadline || !minCgpa || !allowedBranches || !allowedYear) {
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
            collegeId: req.user.college,
            contact_phone,
            contact_email,
            location,
            package_lpa: package,
            stipendDetails,
            role,
            jobDescription,
            visitDate: new Date(),
            applicationDeadline,
            minCgpa,
            allowedBranches,
            allowedYear,
            placeId: []
        });

        // Update the College model to add this company to upcomingCompanies
        await COLLEGE.findByIdAndUpdate(
            req.user.college,
            { $addToSet: { upcomingCompanies: companyId } },
            { new: true }
        );

        // Find eligible students (using Student model)
        const eligibleStudents = await STUDENT.find({
            collegeId: req.user.college,
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

async function getAllCompanies(req, res) {
    try {
        const { status } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        const companies = await Company.find(query).sort({ visit_date: 1 });
        return res.status(200).json({ message: "Success", data: companies });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function getCompaniesComingToCollege(req, res) {
    try {
        const allCompaniesComingToCollege = await COMPANYTOCOLLEGE.find({collegeId : req.user.college})
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

module.exports = {
    addCompany,
    addCompanyToCollege,
    updateCompany,
    getCompanyDetails,
    getAllCompanies,
    updateHiringStatus,
    getEligibleCompanies,
    deleteCompany,
    getCompaniesComingToCollege
};