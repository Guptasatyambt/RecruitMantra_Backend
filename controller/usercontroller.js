const {setuser}=require('../service/auth')
const User=require('../models/usermodel');
const bycrpt=require('bcrypt');
const fs=require('fs')
const isEmailValid=require('../middleware/email_validate');
const { profile } = require('console');
const {getobjecturl,putObject}=require('../middleware/aws')
const nodemailer = require('nodemailer');
const { findByIdAndUpdate } = require('../models/interview');

let otpStore = {};




async function handleregister(req,res){
    try{
    const{email,password} =req.body
    if(!email||!password){
        return res.status(404).json({message:"All field are compulsory"});
    }
   
    const allReadyExist=await User.findOne({email})
    if(allReadyExist){
        return res.status(403).json({message:"User already Exist"})
    }
    const bycrptpassword=await bycrpt.hash(password,10)
    const user=await User.create({
        name:"",
        email:email,
        password:bycrptpassword,
        resume:"",
        profileimage:"",
        college:"",
        branch:"",
        year:"",
        specialization:"",
        interest:"",
        interview:[],
    })
   
    const token=setuser(user);
    return res.status(200).json({message:"Success",data:{token,id:user.id,name:""}});
}
catch(e){
    return res.status(500).json({ message: "Internal Server Error", error: e.message });
}
    }
     
    async function handledetails(req,res){
        const {name,college,branch,year,specialization,interest}=req.body
        if(!name||!college||!branch||!year||!specialization||!interest&&req.file){
            return res.status(400).json("All field are compulsory");
        }
        try{
        const user=req.user;
    const email=user.email;
    const password=user.password;
   const updateduser= await User.findByIdAndUpdate(user._id,
        {$set:{
        name:name,
        email:email,
        password:password,
        resume:req.files['resume'][0].path.replace(/\\/g, '/') ,
        profileimage:req.files['profileimage'][0].path.replace(/\\/g, '/') ,
        college:college,
        branch:branch,
        year:year,
        specialization:specialization,
        interest:interest,
        interview:[],
    }}
    ,{new:true})
    return res.status(200).json({message:"Success",data:{email:email,profile:updateduser.profileimage,resume:updateduser.resume}});
}
catch(e){
    return res.status(500).json({ message: "Internal Server Error", error: e.message });
}
    }

    async function handlelogin(req,res){
        const {email,password}=req.body;
        if(!email ||!password){
            res.status(400).json({message:"enter details correctly"})
            // throw new Error("enter details correctly")
        }
        try{
        const user=await User.findOne({email})
        if(!user){
            return res.status(404).json({message:"User not exist! please sign In"})
            // throw new Error("User not exist! please sign In")
        }
        if(user&& (await bycrpt.compare(password,user.password))){
            const token=setuser(user);
            return res.status(200).json({message:"Success",data:{token,id:user.id,name:user.name}});
        }
        else{
            return res.status(400).json({message:"Incorrect password"})
        }
    }
    catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
    }

    async function getinfo(req,res){
        
        try{
            const email=req.user.email;
            const user=await User.findOne({email})
            return res.status(200).json(user);
        }
        catch(e){
            return res.status(500).json({ message: "Internal Server Error", error: e.message });
        }
    }
    
    async function givecoins(req,res){
        const email=req.user.email;
        const user=await User.findOne({email})
        var coins=user.coins
        coins+=100
        const updateduser= await User.findByIdAndUpdate(user._id,
            {$set:{
            coins:coins,
        }}
        ,{new:true})
        return res.status(200).json(updateduser)
    }

    async function updatepassword(req,res){
        const {email,password}=req.body;
        try{
        const user=await User.findOne({email})
        if(!user){
            return res.status(404).json({message:"No user find"})
        }
        const bycrptpassword=await bycrpt.hash(password,10)
        const updateduser= await User.findByIdAndUpdate(user._id,
            {$set:{
            password:bycrptpassword ,
        }}
        ,{new:true})
        return res.status(200).json({message:"Password set successfully"});
    
    }catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }

    }

    async function generateAndSendOTP(req, res) {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
    
        try {
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
    InternView` };
            const info = await transporter.sendMail(mailOptions);
            return res.status(200).json({ message: 'OTP sent to email successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }

    async function validateotp(req,res) {
    const{email,otp}=req.body;
    try{
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
    }catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
    }

      async function handleimage(req,res) {
        try{
            const user=req.user;
            // const img=await getobjecturl("133507648727420508.jpg")
            const url=await putObject(`image-${Date.now()}.jpeg`,"image/jpeg")
            console.log(url);
        const updateduser= await User.findByIdAndUpdate(user._id,
            {$set:{
            profileimage:req.file.path.replace(/\\/g, '/') ,
        }}
        ,{new:true})
        console.log(req.file.path.replace(/\\/g, '/') )
        return res.status(200).json({message:"Success",data:{profile:updateduser.profileimage}});
    }
    catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
      }

      async function updateresume(req,res) {
        try{
            const user=req.user;
        const updateduser= await User.findByIdAndUpdate(user._id,
            {$set:{
            resume:req.file.path.replace(/\\/g, '/') ,
        }}
        ,{new:true})
        console.log(req.file.path.replace(/\\/g, '/') )
        return res.status(200).json({message:"Success",data:{resume:updateduser.resume}});
    }
    catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
      }

      async function updateyear(req,res) {
        const {year}=req.body
        try{
            
            const user=req.user;
        const updateduser= await User.findByIdAndUpdate(user._id,
            {$set:{
            year:year ,
        }}
        ,{new:true})
        return res.status(200).json({message:"Success",data:{year:updateduser.year}});
    }
    catch(e){
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
      }

    
    module.exports={handleregister,handledetails ,handlelogin,getinfo,givecoins,handleimage,updateyear,updateresume,generateAndSendOTP,validateotp,updatepassword};