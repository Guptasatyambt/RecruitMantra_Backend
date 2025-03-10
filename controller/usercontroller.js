const { setuser } = require('../service/auth')
const User = require('../models/usermodel');
const emailvarification=require('../middleware/email_validate')
const bycrpt = require('bcryptjs');
const fs = require('fs')
const { putObjectimage, putObjectresume, getobjecturlassets, getobjecturlimage } = require('../middleware/aws')
const nodemailer = require('nodemailer');

let otpStore = {};
async function test(req,res) {
return res.status(200).json({message:"Server is running"});
}
async function handleregister(req, res) {
    try {
        const { email, password } = req.body
        if (!email || !password) {
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
            resume: "",
            profileimage: "",
            college: "",
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
        return res.status(200).json({ message: "Success", data: { token, id: user.id, name: "" } });
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
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
        if (user && (await bycrpt.compare(password, user.password))) {
            const token = setuser(user);
            return res.status(200).json({ message: "Success", data: { token, id: user.id, name: user.name } });
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
        const image_url = await getobjecturlimage(user.profileimage)
        const resume_url = await getobjecturlassets(user.resume)
        return res.status(200).json({ user, image: image_url, resume: resume_url });
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
async function updatepassword(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "No user find" })
        }
        const bycrptpassword = await bycrpt.hash(password, 10)
        const updateduser = await User.findByIdAndUpdate(user._id,
            {
                $set: {
                    password: bycrptpassword,
                }
            }
            , { new: true })
        return res.status(200).json({ message: "Password set successfully" });

    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }

}
async function generateAndSendOTP(req, res) {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(403).json({ message: "User does not exist" })
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
            subject: 'Your One-Time Password (OTP) for Password Reset',
            text: `
    Dear user,
    
    We received a request to reset the password for your account. Please use the following One-Time Password (OTP) to proceed with the reset:
    
    Your OTP: ${otp}
    
    This OTP is valid for one-time use only and will expire in 15 minutes. If you did not request a password reset, please ignore this email.
    
    Best regards,
    RecruitMantra` };
        const info = await transporter.sendMail(mailOptions);
        setTimeout(() => {
            delete otpStore[email]; // Remove the OTP after 15 minutes
        }, 15 * 60 * 1000);
        return res.status(200).json({ message: 'OTP sent to email successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
async function validateotp(req, res) {
    const { email, otp } = req.body;
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
    generateAndSendOTP,
    validateotp,
    updatepassword,
    uploadassets,
    sendVarifyEmailOtp,
    validateEmailotp,
   test
};
