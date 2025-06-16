const Applicant = require('../models/career');
const { putObjectresume } = require('../middleware/aws')
const nodemailer = require('nodemailer');
const emailvarification=require('../middleware/email_validate')

async function cheak(req,res){
	const {email}=req.body
	const isEmailValidate= await emailvarification(email)
        if(isEmailValidate.valid==false){
            return res.status(401).json({data:{isEmailValidate}});
        }
}

async function handleapply(req, res) {
    const { email,name,mobile,gender,state,city,address,high_school_board,high_school_percentage,intermidiate_board,intermidiate_percentage,UG_percentage, college, branch, passing_year, specialization, skills,position } = req.body
    if (!email||!name||!mobile||!gender||!state||!city||!address||!high_school_board||!high_school_percentage||!intermidiate_board||!intermidiate_percentage||!UG_percentage || !college || !branch || !passing_year || !specialization||!skills||!position) {
        return res.status(400).json("All field are compulsory");
    }
    try {
//        const isEmailValidate= await emailvarification(email)
  //      if(isEmailValidate.valid==false){
    //        return res.status(401).json("Please Enter Correct Email");
      //  }
        const applicant = await Applicant.create({
            name: name,
            email: email,
            resume: "",
            mobile: mobile,
            gender:gender,
            state:state,
            city:city,
            address:address,
            high_school_board:high_school_board,
            high_school_percentage:high_school_percentage,
            intermidiate_board:intermidiate_board,
            intermidiate_percentage:intermidiate_percentage,
            UG_percentage:UG_percentage,
            college: college,
            branch: branch,
            passing_year:passing_year,
            specialization: specialization,
            skills: skills,
            position:position,
        })
        
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
            subject: ' Thank You for Applying to RecruitMantra!',
            text: `
    Dear ${name},

Thank you for taking the time to apply to RecruitMantra. We have successfully received your application for the ${position} role.

Our team is currently reviewing your qualifications, and if your profile aligns with our requirements, we will contact you for the next steps in the hiring process.

In the meantime, feel free to explore more about us on our website or reach out if you have any questions.

Thank you again for your interest in joining RecruitMantra. We appreciate your effort and look forward to connecting with you soon!

Best Regards,
HR Team | RecruitMantra
🌐 https://www.recruitmantra.com/` };
        const info = await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Success" });
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}



async function uploadresume(req, res) {
    try {
        const user = req.user;

        const resume_key = `file-${user._id}-${Date.now()}.pdf`;
        const path_resume = `resume/${resume_key}`
        const resume_url = await putObjectresume(resume_key, "application/pdf")
        const updatedApplicant = await Applicant.findByIdAndUpdate(user._id,
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



module.exports = {
    handleapply,
   cheak, 
   uploadresume
};
