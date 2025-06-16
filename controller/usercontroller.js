const { setuser } = require('../service/auth')
const User = require('../models/usermodel');
const Student = require('../models/student')
const DefaultUser = require('../models/defaultUser')
const CollegeAdmin = require('../models/cAdmin')
const Admin =require('../models/admin')
const College = require('../models/college')
const emailverification = require('../middleware/email_validate')
const bcrypt = require('bcryptjs');
// const sendEmail=require('../middleware/sendemail')
const mongoose = require('mongoose')
const fs = require('fs')
const COLLEGE = require('../models/college');
const { putObjectimage, putObjectresume, getobjecturlassets, getobjecturlimage } = require('../middleware/aws')
const nodemailer = require('nodemailer');
const BRANCH = require('../models/branch');

let otpStore = {};
async function test(req, res) {
    return res.status(200).json({ message: "Server is running" });
}

async function getCollegeDetails(userId, role) {
    if (role == "college_admin") {
        const collegeDetails = await CollegeAdmin.findOne({ cAdminId: userId })
        return collegeDetails;
    }
    else if (role == "student") {
        const collegeDetails = await Student.findOne({ studentId: userId })
        return collegeDetails;
    }
    else if (role == "default") {
        const collegeDetails = await DefaultUser.findOne({ defaultUserId: userId })
        return collegeDetails;
    }
    return null;
}

// Regular student registration
async function registerDefaultUser(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { firstName, lastName, email, password,collegeId } = req.body;
        if (!firstName || !lastName || !email || !password||!collegeId ) {
           
            return res.status(400).json({ message: "All fields are required" });
        }

        const alreadyExist = await User.findOne({ email }).session(session);
        if (alreadyExist) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create([{
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'default',
            profileimage: "",
            technicalInterview: [],
            hrInterview: [],
            managerialInterview: [],
            seriesInterview: []
        }], { session });

        await DefaultUser.create([{
            defaultUserId: user[0]._id,
            coins: 100,
            collegeId,
            resume:"NA",
            
        }], { session });
        
        const otp = Math.floor(100000 + Math.random() * 900000);
        
        const expiryTime = Date.now() + 15 * 60 * 1000; // Set expiration time to 15 minutes
        otpStore[email] = {
            otp,
            expiresAt: expiryTime,
            isUsed: false
        };
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Use environment variables for security
                pass: process.env.EMAIL_PASS
            }
        });

        // Email options
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your One-Time Password (OTP) for Email Varification',
            text: `
    Dear user,

Thank you for registering with RecruitMantra. To complete your registration and verify your email address, please use the following One-Time Password (OTP):

Your OTP: ${otp}

This OTP is valid for one-time use only and will expire in 15 minutes. If you did not initiate this request, please ignore this email.

Verifying your email helps us ensure the security of your account.

Best regards,  
- RecruitMantra` };
        const info = await transporter.sendMail(mailOptions);
        setTimeout(() => {
            delete otpStore[email]; // Remove the OTP after 15 minutes
        }, 15 * 60 * 1000);
        
        await session.commitTransaction();

        const token = setuser(user[0]);
        return res.status(201).json({
            message: "Registration successful",
            data: {
                token,
                id: user[0]._id,
                firstName,
                lastName,
                role: user[0].role
            }
        });
    } catch (e) {
        await session.abortTransaction();
        return res.status(500).json({
            message: "Registration failed",
            error: e.message
        });
    } finally {
        session.endSession();
    }
}
// async function registerStudent(req, res) {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const { firstName, lastName, email, password,collegeId,rollNo } = req.body;
//         if (!firstName || !lastName || !email || !password||!rollNo||!collegeId ) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         const alreadyExist = await User.findOne({ email }).session(session);
//         if (alreadyExist) {
//             return res.status(409).json({ message: "User already exists" });
//         }

//         // const isEmailValidate = await emailvarification(email);
//         // if (!isEmailValidate) {
//         //     return res.status(400).json({ message: "Invalid email address" });
//         // }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const user = await User.create([{
//             firstName,
//             lastName,
//             email,
//             password: hashedPassword,
//             role: 'student',
//             profileimage: "",
//             technicalInterview: [],
//             hrInterview: [],
//             managerialInterview: [],
//             seriesInterview: []
//         }], { session });

//         await Student.create([{
//             studentId: user[0]._id,
//             collegeId:collegeId,
//             rollNo:rollNo,
//             coins: 100,
//             cgpa: 0,
//             cap: 0
//         }], { session });

//         await session.commitTransaction();

//         const token = setuser(user[0]);
//         return res.status(201).json({
//             message: "Registration successful",
//             data: {
//                 token,
//                 id: user[0]._id,
//                 firstName,
//                 lastName,
//                 role: user[0].role
//             }
//         });
//     } catch (e) {
//         await session.abortTransaction();
//         return res.status(500).json({
//             message: "Registration failed",
//             error: e.message
//         });
//     } finally {
//         session.endSession();
//     }
// }

// College admin registration
async function registerCollegeAdmin(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { firstName, lastName, email, password,mobile,collegeId } = req.body;
        if (!firstName || !lastName || !email || !password ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const alreadyExist = await User.findOne({ email }).session(session);
        if (alreadyExist) {
            return res.status(409).json({ message: "User already exists" });
        }

        // const isEmailValidate = await emailvarification(email);
        // if (!isEmailValidate) {
        //     return res.status(400).json({ message: "Invalid email address" });
        // }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create([{
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'college_admin',
            profileimage: "",
            technicalInterview: [],
            hrInterview: [],
            managerialInterview: [],
            seriesInterview: []
        }], { session });

        const cuser=await CollegeAdmin.create([{
            cAdminId: user[0]._id,
            collegeId:collegeId,
            isApproved: false,
            mobile:mobile,
            verified:false
        }], { session });
        const collegeDetails = await College.findOne({ _id: collegeId })
        const collegeName = collegeDetails.name
        const superAdmins = await User.find({ role: 'super_admin' });
        //create otp
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiryTime = Date.now() + 15 * 60 * 1000; // Set expiration time to 15 minutes
        otpStore[email] = {
            otp,
            expiresAt: expiryTime,
            isUsed: false
        };
        const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        if (superAdmins.length > 0) {
            for (const admin of superAdmins) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: admin.email,
                    subject: 'New College Admin Registration',
                    html: `
                        <h2>New College Admin Registration</h2>
                        <p>A new college admin has registered and is awaiting approval:</p>
                        <ul>
                            <li><strong>Name:</strong> ${firstName + " " + lastName}</li>
                            <li><strong>Email:</strong> ${email}</li>
                            <li><strong>College:</strong> ${collegeName}</li>
                        </ul>
                        <p>Please log in to the admin dashboard to approve or reject this request.</p>
                    `
                };

                await transporter.sendMail(mailOptions);
            }
        }
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your One-Time Password (OTP) for Email Varification',
            text: `
    Dear user,

Thank you for registering with RecruitMantra. To complete your registration and verify your email address, please use the following One-Time Password (OTP):

Your OTP: ${otp}

This OTP is valid for one-time use only and will expire in 15 minutes. If you did not initiate this request, please ignore this email.

Verifying your email helps us ensure the security of your account.

Best regards,  
- RecruitMantra` };
//         const info = await transporter.sendMail(mailOptions);
//         setTimeout(() => {
//             delete otpStore[email]; // Remove the OTP after 15 minutes
//         }, 15 * 60 * 1000);
        await session.commitTransaction();

        const token = setuser(user[0]);
        return res.status(201).json({
            message: "College admin registration successful. Your account is pending approval from admin.",
            data: {
                token,
                id: user[0]._id,
                firstName,
                lastName,
                role: user[0].role
            }
        });
    } catch (e) {
        await session.abortTransaction();
        return res.status(500).json({
            message: "Registration failed",
            error: e.message
        });
    } finally {
        session.endSession();
    }
}

// Super admin registration (should be restricted or done manually)
async function registerSuperAdmin(req, res) {
    try {
        // Check if the request is authorized (e.g., from a secure admin setup process)
        // This should be highly restricted
        const { email, password, firstName,lastName, secretKey } = req.body;
        // Verify secret key (should be stored securely, not in code)
        if (secretKey !== process.env.SUPER_ADMIN_SECRET_KEY) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        if (!email || !password || !firstName||!lastName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(403).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'super_admin',
            isApproved: true,
            college: null,
            profileimage: "",
            branch: "",
            year: "",
            specialization: "",
            interest: "",
            resume: "",
            interview: []
        });

        const token = setuser(user);
        return res.status(201).json({
            message: "Super admin created successfully",
            data: { token, id: user._id, name: user.name, role: user.role }
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// Get all college admins (for super admin)
const getAllCollegeAdmins = async (req, res) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Access denied. Super admin privileges required" });
        }

        // Step 1: Get all users with role 'college_admin'
        const collegeAdminUsers = await User.find(
            { role: 'college_admin' },
            { firstName: 1, lastName: 1, email: 1, _id: 1 }
        );
        // Step 2: Get all CollegeAdmin documents
        const collegeAdmins = await CollegeAdmin.find();
        // Step 3: Get all colleges
        const colleges = await College.find({}, { _id: 1, name: 1 });
        const collegeMap = new Map(colleges.map(c => [c._id.toString(), c.name]));
        // Step 4: Merge data safely
        const combinedData = collegeAdminUsers.map(user => {
    const adminRecord = collegeAdmins.find(
        ca => ca.cAdminId?.toString() === user._id.toString()
    );

    let collegeName = 'Unknown';
    if (adminRecord && adminRecord.collegeId) {
        collegeName = collegeMap.get(adminRecord.collegeId.toString()) || 'Unknown';
    }

    return {
        _id:user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isApproved: adminRecord?.isApproved ?? false,
        college: collegeName
    };
});

        return res.status(200).json({
            message: "Success",
            data: combinedData
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


        const path_image = `images/${image_key}`
        const path_resume = `resume/${resume_key}`

async function uploadassets(req, res) {
    try {
        const user = req.user;
        const user_id = user._id;
        const image_key = `IMG-${user_id}-${Date.now()}.jpg`;
        const resume_key = `file-${user_id}-${Date.now()}.pdf`;

        const path_image = `images/${image_key}`
        const path_resume = `resume/${resume_key}`
        if(user.role==='default'){
            await DefaultUser.findOneAndUpdate(
                {defaultUserId:user._id},
                {
                $set: {
                    resume: path_resume
                }
            },
            { new: true }
            )
        }
        await User.findByIdAndUpdate(user_id,
            {
                $set: {
                    profileimage: path_image
                }
            }
            , { new: true })

        const image_url = await putObjectimage(image_key, "image/jpg")
        const resume_url = await putObjectresume(resume_key, "application/pdf")
        res.status(200).json({ message: "success", url_image: image_url, url_resume: resume_url })
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function handledetails(req, res) {
    const { name, college, branch, year, specialization, interest } = req.body
    if (!name || !college || !branch || !year || !specialization || !interest) {
        return res.status(400).json("All field are compulsory");
    }
    try {
        const user = req.user;
        const email = user.email;
        const password = user.password;
        const updateduser = await User.findByIdAndUpdate(user._id,
            {
                $set: {
                    name: name,
                    email: email,
                    password: password,
                    college: college,
                    branch: branch,
                    year: year,
                    specialization: specialization,
                    interest: interest,
                    interview: [],
                }
            }
            , { new: true })
        return res.status(200).json({ message: "Success", data: { email: email, profile: updateduser.profileimage, resume: updateduser.resume } });
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function handlelogin(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "enter details correctly" })
        // throw new Error("enter details correctly")
    }
    try {
        const user = await User.findOne({ email })
        
        if (!user) {
            return res.status(404).json({ message: "User not exist! please sign In" })
            // throw new Error("User not exist! please sign In")
        }

        // Check if college admin is approved
        if (user.role === 'college_admin') {
            const cAdminDetails = await CollegeAdmin.findOne({ cAdminId: user._id })
            if(!cAdminDetails.isApproved)
            return res.status(403).json({ message: "Your account is pending approval from super admin. Please Contact-Us for more details." });
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = setuser(user);
            const collegeDetails = getCollegeDetails(user._id, user.role)
            return res.status(200).json({
                message: "Success",
                data: {
                    token,
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    collegeId: collegeDetails._id
                }
            });
        }
        else {
            return res.status(400).json({ message: "Incorrect password" })
        }
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}
async function getinfo(req, res) {
    try {
        const email = req.user.email;
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "No user found with this email" })
        }
        let defaultOrStudent="",image_url="",resume_url="";

        if(req.user.role=='student'){
            defaultOrStudent = await Student.findOne({ studentId: req.user._id });
        }
        else if(req.user.role=='default'){
            defaultOrStudent = await DefaultUser.findOne({ defaultUserId: req.user._id });
        }
        else if(req.user.role=='college_admin'){
            defaultOrStudent = await CollegeAdmin.findOne({ cAdminId: req.user._id });
             return res.status(200).json({ user,defaultOrStudent,image: image_url });
        }
        else{
            defaultOrStudent = await Admin.findOne({ adminId: req.user._id });
            return res.status(200).json({ user,defaultOrStudent,image: image_url });
        }
        const branch=await BRANCH.findById(defaultOrStudent.branchId)
        const college = await COLLEGE.findById(defaultOrStudent.collegeId);
        if ( user.profileimage && defaultOrStudent.resume) {
            resume_url = await getobjecturlassets(defaultOrStudent.resume)
            image_url = await getobjecturlimage(user.profileimage)
        }
            return res.status(200).json({ 
                user,
                defaultOrStudent,
                college:college.name,
                branch:branch.branchName,
                image: image_url,
                resume: resume_url });
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}
async function getcoin(req, res) {
    try {
        const userId = req.user._id;

        // First get the user to determine their role
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let coins;
        if (user.role === 'student') {
            const student = await Student.findOne({ studentId: userId });
            coins = student?.coins || 0;
        } else if (user.role === 'default') {
            const defaultUser = await DefaultUser.findOne({ defaultUserId: userId });
            coins = defaultUser?.coins || 0;
        } else {
            // For college_admin or super_admin, coins might not be applicable
            coins = 0;
        }

        return res.status(200).json({ coins });
    } catch (e) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: e.message
        });
    }
}
async function givecoins(req, res) {
    const email = req.user.email;
    const user = await User.findOne({ email })
    var coins = user.coins
    coins += 100
    const updateduser = await User.findByIdAndUpdate(user._id,
        {
            $set: {
                coins: coins,
            }
        }
        , { new: true })
    return res.status(200).json(updateduser)
}

async function generateAndSendUrl(req, res) {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });
        const token = setuser(user);
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiryTime = Date.now() + 15 * 60 * 1000; // Set expiration time to 15 minutes
        otpStore[email] = {
            otp,
            expiresAt: expiryTime,
            isUsed: false
        };
        const link = `${process.env.CLIENT_URL}/reset-password?t=${token}?r=${otp}?h=${email}`;
        await sendEmail(email, "Password Reset", `<p>Click to reset: <a href="${link}">${link}</a></p>`);
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email options
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - RecruitMantra',
            text: `
        Dear user,
        
        We received a request to reset the password for your RecruitMantra account. If you initiated this request, please visit the following link to set a new password:
        
        ${link}
        
        If you did not request a password reset, you can safely ignore this email — no changes will be made to your account.
        
        If you need any assistance, feel free to reach out to our support team.
        
        Best regards,  
        The RecruitMantra Team
        `,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <p>Dear user,</p>
                <p>We received a request to reset the password for your RecruitMantra account. If you initiated this request, please click the button below to set a new password:</p>
                <p style="text-align: center;">
                    <a href="${link}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                </p>
                <p>If you did not request a password reset, you can safely ignore this email — no changes will be made to your account.</p>
                <p>If you need any assistance, feel free to reach out to our support team.</p>
                <p>Best regards,<br/>The RecruitMantra Team</p>
            </div>
            `
        };
        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Reset link sent to email" });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
async function changePassword(req, res) {
    const email = req.user.email;
    const { password, otp, urlEmail } = req.body;
    try {
        if (email !== urlEmail) {
            return res.status(400).json({ message: "The link is invalid.Please double-check and try again." });
        }
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid user" });
        const storedOtpData = otpStore[email];

        if (!storedOtpData) {
            return res.status(404).json({ success: false, message: 'The link is expired .Please double-check and try again.' });
        }

        const currentTime = Date.now();

        // Check if OTP is expired
        if (currentTime > storedOtpData.expiresAt) {
            delete otpStore[email];  // Delete expired OTP
            return res.status(400).json({ success: false, message: 'The link is expired .Please double-check and try again.' });
        }

        // Check if OTP has already been used
        if (storedOtpData.isUsed) {
            delete otpStore[email];
            return res.status(400).json({ success: false, message: 'The link is expired .Please double-check and try again.' });
        }

        // Check if entered OTP matches the stored OTP
        if (storedOtpData.otp !== parseInt(otp)) {
            return res.status(400).json({ success: false, message: 'The link is invalid .Please double-check and try again.' });
        }

        // Mark OTP as used
        otpStore[email].isUsed = true;
        delete otpStore[email];

        const bcryptpassword = await bcrypt.hash(password, 10);
        const updateduser = await User.findByIdAndUpdate(user._id,
            {
                $set: {
                    password: bcryptpassword,
                }
            }
            , { new: true })
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
}

async function sendVerifyEmailOtp(req, res) {
    const { user } = req;
    const { email } = user;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(403).json({ message: "User does not Exist" })
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiryTime = Date.now() + 15 * 60 * 1000; // Set expiration time to 15 minutes
        otpStore[email] = {
            otp,
            expiresAt: expiryTime,
            isUsed: false
        };

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Use environment variables for security
                pass: process.env.EMAIL_PASS
            }
        });

        // Email options
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your One-Time Password (OTP) for Email Varification',
            text: `
    Dear user,

Thank you for registering with RecruitMantra. To complete your registration and verify your email address, please use the following One-Time Password (OTP):

Your OTP: ${otp}

This OTP is valid for one-time use only and will expire in 15 minutes. If you did not initiate this request, please ignore this email.

Verifying your email helps us ensure the security of your account.

Best regards,  
- RecruitMantra` };
        const info = await transporter.sendMail(mailOptions);
        // setTimeout(() => {
        //     delete otpStore[email]; // Remove the OTP after 15 minutes
        // }, 15 * 60 * 1000);
        return res.status(200).json({ message: 'OTP sent to email successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
async function validateEmailotp(req, res) {
    const user  = req.user;
    const email = user.email;
    const { otp } = req.body;
    try {
        const storedOtpData = otpStore[email];

        if (!storedOtpData) {
            return res.status(404).json({ success: false, message: 'OTP not found or expired' });
        }

        const currentTime = Date.now();

        // Check if OTP is expired
        if (currentTime > storedOtpData.expiresAt) {
            delete otpStore[email];  // Delete expired OTP
            return res.status(400).json({ success: false, message: 'OTP is expired' });
        }

        // Check if OTP has already been used
        if (storedOtpData.isUsed) {
            delete otpStore[email];
            return res.status(400).json({ success: false, message: 'OTP is already used' });
        }

        // Check if entered OTP matches the stored OTP
        if (storedOtpData.otp !== parseInt(otp)) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Mark OTP as used
        otpStore[email].isUsed = true;
        delete otpStore[email];  // Optionally delete OTP after use
        if(user.role==='default'){
            await DefaultUser.findOneAndUpdate(
                {defaultUserId:user._id},
                {
                $set: {
                    verified: true
                }
            },
            { new: true }
            )
        }
        else if(user.role==='college_admin'){
            await CollegeAdmin.findOneAndUpdate(
                {cAdminId:user._id},
                {
                $set: {
                    verified: true
                }
            },
            { new: true }
            )
        }
        return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}
async function handleimage(req, res) {
    try {
        const { user } = req;
        const image_key = `IMG-${user._id}-${Date.now()}.jpg`;
        const path = `images/${image_key}`
        const url = await putObjectimage(image_key, "image/jpg")
        const updateduser = await User.findByIdAndUpdate(user._id,
            {
                $set: {
                    profileimage: path,
                }
            }
            , { new: true })
        return res.status(200).json({ message: "Success", data: { profile: url } });
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function updateresume(req, res) {
    try {
        const user = req.user;
        const resume_key = `file-${user._id}-${Date.now()}.pdf`;
        const path_resume = `resume/${resume_key}`
        const resume_url = await putObjectresume(resume_key, "application/pdf")
        if(user.role==='default'){
           const updateduser= await DefaultUser.findOneAndUpdate(
                {defaultUserId:user._id},
                {
                $set: {
                    resume: path_resume
                }
            },
            { new: true }
            )
            return res.status(200).json({ message: "Success", data: { resume: resume_url } });
        }
        if(user.role==='student'){
           const updateduser= await Student.findOneAndUpdate(
                {studentId:user._id},
                {
                $set: {
                    resume: path_resume
                }
            },
            { new: true }
            )
            return res.status(200).json({ message: "Success", data: { resume: resume_url } });
        }
        return res.status(200).json({ message: "Roll must be default or student", data: { resume: resume_url } });
        
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function updateyear(req, res) {
    const { year } = req.body;
    try {
        const { user } = req;
        
        // Only update Student model if user is a student
        if (user.role === 'student') {
            const updatedStudent = await Student.findOneAndUpdate(
                { studentId: user._id },
                { $set: { year: year } },
                { new: true }
            );
            
            return res.status(200).json({ 
                message: "Success", 
                data: { year: updatedStudent.year } 
            });
        }
        
        return res.status(400).json({ 
            message: "Year can only be updated for students" 
        });
    } catch (e) {
        return res.status(500).json({ 
            message: "Internal Server Error", 
            error: e.message 
        });
    }
}


module.exports = {
    registerDefaultUser,
    // registerStudent,
    registerCollegeAdmin,
    registerSuperAdmin,
    handledetails,
    handlelogin,
    getinfo,
    getcoin,
    givecoins,
    handleimage,
    updateyear,
    updateresume,
    generateAndSendUrl,
    changePassword,
    uploadassets,
    sendVerifyEmailOtp,
    validateEmailotp,
    test,
    getAllCollegeAdmins
};
