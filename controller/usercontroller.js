const { setuser } = require('../service/auth')
const User = require('../models/usermodel');
const emailvarification=require('../middleware/email_validate')
const bycrpt = require('bcryptjs');
// const sendEmail=require('../middleware/sendemail')
const fs = require('fs')
const { putObjectimage, putObjectresume, getobjecturlassets, getobjecturlimage } = require('../middleware/aws')
const nodemailer = require('nodemailer');

let otpStore = {};
async function test(req,res) {
return res.status(200).json({message:"Server is running"});
}

// Regular student registration
async function handleregister(req, res) {
    try {
        const { email, password, college } = req.body
        if (!email || !password || !college) {
            return res.status(404).json({ message: "All field are compulsory" });
        }

        const allReadyExist = await User.findOne({ email })
        if (allReadyExist) {
            return res.status(403).json({ message: "User already Exist" })
        }
        const bycrptpassword = await bycrpt.hash(password, 10)
	    const isEmailValidate= await emailvarification(email)

        const user = await User.create({
            name: "",
            email: email,
            password: bycrptpassword,
            role: 'student',
            resume: "",
            profileimage: "",
            college: college,
            branch: "",
            year: "",
            specialization: "",
            interest: "",
            interview: [],
            HRInterview:[],
            ManagerialInterview:[],
            SeriesInterview:[]
        })

        const token = setuser(user);
        return res.status(200).json({ message: "Success", data: { token, id: user.id, name: "", role: user.role } });
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

// College admin registration
async function registerCollegeAdmin(req, res) {
    try {
        const { email, password, name, college } = req.body;
        
        if (!email || !password || !name || !college) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(403).json({ message: "User already exists" });
        }

        const hashedPassword = await bycrpt.hash(password, 10);
        const isEmailValidate = await emailvarification(email);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'college_admin',
            isApproved: false, // College admins need approval from super admin
            college,
            profileimage: "",
            branch: "",
            year: "",
            specialization: "",
            interest: "",
            resume: "",
            interview: []
        });

        // Notify super admins about new college admin registration
        const superAdmins = await User.find({ role: 'super_admin' });
        if (superAdmins.length > 0) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            for (const admin of superAdmins) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: admin.email,
                    subject: 'New College Admin Registration',
                    html: `
                        <h2>New College Admin Registration</h2>
                        <p>A new college admin has registered and is awaiting approval:</p>
                        <ul>
                            <li><strong>Name:</strong> ${name}</li>
                            <li><strong>Email:</strong> ${email}</li>
                            <li><strong>College:</strong> ${college}</li>
                        </ul>
                        <p>Please log in to the admin dashboard to approve or reject this request.</p>
                    `
                };

                await transporter.sendMail(mailOptions);
            }
        }

        return res.status(201).json({
            message: "College admin registration successful. Your account is pending approval from super admin.",
            data: { id: user._id }
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// Super admin registration (should be restricted or done manually)
async function registerSuperAdmin(req, res) {
    try {
        // Check if the request is authorized (e.g., from a secure admin setup process)
        // This should be highly restricted
        const { email, password, name, secretKey } = req.body;
        
        // Verify secret key (should be stored securely, not in code)
        if (secretKey !== process.env.SUPER_ADMIN_SECRET_KEY) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(403).json({ message: "User already exists" });
        }

        const hashedPassword = await bycrpt.hash(password, 10);

        const user = await User.create({
            name,
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
async function getAllCollegeAdmins(req, res) {
    try {
        // Only super admin can view all college admins
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Access denied. Super admin privileges required" });
        }
        
        const collegeAdmins = await User.find(
            { role: 'college_admin' },
            { name: 1, email: 1, college: 1, isApproved: 1, createdAt: 1 }
        );
        
        return res.status(200).json({
            message: "Success",
            data: collegeAdmins
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

async function uploadassets(req, res) {
    try {
        const user = req.user;
        const user_id = user._id;
        const image_key = `IMG-${user_id}-${Date.now()}.jpg`;
        const resume_key = `file-${user_id}-${Date.now()}.pdf`;


        const path_image = `images/${image_key}`
        const path_resume = `resume/${resume_key}`

        await User.findByIdAndUpdate(user_id,
            {
                $set: {
                    profileimage: path_image,
                    resume: path_resume
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
        if (user.role === 'college_admin' && !user.isApproved) {
            return res.status(403).json({ message: "Your account is pending approval from super admin" });
        }
        
        if (user && (await bycrpt.compare(password, user.password))) {
            const token = setuser(user);
            return res.status(200).json({ 
                message: "Success", 
                data: { 
                    token, 
                    id: user.id, 
                    name: user.name, 
                    role: user.role,
                    college: user.college,
                    isApproved: user.isApproved
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
        console.log(req.user);
        const email = req.user.email;
        
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "No user found with this email" })
        }
        if (user.profileimage && user.resume) {
            const image_url = await getobjecturlimage(user.profileimage)
            const resume_url = await getobjecturlassets(user.resume)
            return res.status(200).json({ user, image: image_url, resume: resume_url });
        }
        else
        return res.status(200).json({ user });
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}
async function getcoin(req,res){
    try {
        const email = req.user.email;
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "No user found with this email" })
        }
        return res.status(200).json({coin:user.coins});
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
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
    try{
        const user = await User.findOne({email});
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
    const email=req.user.email;
    const { password,otp,urlEmail } = req.body;
    try {
        if(email!==urlEmail){
            return res.status(400).json({ message: "The link is invalid.Please double-check and try again." });
        }
        const user = await User.findOne({email});
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

        const bycrptpassword = await bycrpt.hash(password, 10);
        const updateduser = await User.findByIdAndUpdate(user._id,
            {
                $set: {
                    password: bycrptpassword,
                }
            }
            , { new: true })
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
}

async function sendVarifyEmailOtp(req, res) {
    const user = req.user;
    const email = user.email;

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
    const user = req.user;
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
        return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}
async function handleimage(req, res) {
    try {
        const user = req.user;
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
        const updateduser = await User.findByIdAndUpdate(user._id,
            {
                $set: {
                    resume: path_resume,
                }
            }
            , { new: true })

        return res.status(200).json({ message: "Success", data: { resume: resume_url } });
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function updateyear(req, res) {
    const { year } = req.body
    try {

        const user = req.user;
        const updateduser = await User.findByIdAndUpdate(user._id,
            {
                $set: {
                    year: year,
                }
            }
            , { new: true })
        return res.status(200).json({ message: "Success", data: { year: updateduser.year } });
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}


module.exports = {
    handleregister,
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
    sendVarifyEmailOtp,
    validateEmailotp,
    test,
    registerCollegeAdmin,
    registerSuperAdmin,
    getAllCollegeAdmins
};
