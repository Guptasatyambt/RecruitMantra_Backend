const Company = require('../models/companies');
const nodemailer = require('nodemailer');
const User = require('../models/usermodel');

async function addCompany(req, res) {
    try {
        const {
            company_name,
            industry,
            position,
            package_lpa,
            job_description,
            visit_date,
            application_deadline,
            eligibility_criteria
        } = req.body;

        // Validate required fields
        if (!company_name || !industry || !position || !package_lpa || 
            !job_description || !visit_date || !application_deadline || !eligibility_criteria) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const company = await Company.create({
            company_name,
            industry,
            position,
            package_lpa,
            job_description,
            visit_date,
            application_deadline,
            eligibility_criteria,
            students_hired: 0,
            status: 'upcoming'
        });

        // Notify eligible students via email
        const eligibleStudents = await User.find({
            year: eligibility_criteria.allowed_batch_year,
            branch: { $in: eligibility_criteria.allowed_branches }
        });

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
                to: student.email,
                subject: `New Job Opportunity: ${company_name} is Hiring!`,
                html: `
                    <h2>New Campus Recruitment Opportunity</h2>
                    <p>Dear ${student.name},</p>
                    <p>We're excited to inform you that ${company_name} is visiting our campus for recruitment!</p>
                    
                    <h3>Job Details:</h3>
                    <ul>
                        <li><strong>Position:</strong> ${position}</li>
                        <li><strong>Package:</strong> ${package_lpa} LPA</li>
                        <li><strong>Visit Date:</strong> ${new Date(visit_date).toLocaleDateString()}</li>
                        <li><strong>Application Deadline:</strong> ${new Date(application_deadline).toLocaleDateString()}</li>
                    </ul>

                    <p>Please log in to your account for more details and to apply.</p>

                    <p>Best regards,<br>Campus Recruitment Team</p>
                `
            };

            await transporter.sendMail(mailOptions);
        }

        return res.status(201).json({ message: "Company added successfully", data: company });
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
    updateCompany,
    getCompanyDetails,
    getAllCompanies,
    updateHiringStatus,
    getEligibleCompanies,
    deleteCompany
}; 