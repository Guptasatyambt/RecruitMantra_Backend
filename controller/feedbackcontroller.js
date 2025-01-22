const Feedback = require('../models/feedback');
const User = require('../models/usermodel');
const nodemailer = require('nodemailer');

async function handlefeedback(req, res) {
    try {
    const email = req.user.email;
    const { userFeedback } = req.body; // Changed the variable name to avoid conflict
     if (!email || !userFeedback) {
        return res.status(400).json({message:"Give Us Feedback"});
    }
   const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({message:"User Not Found"});
        }
        const _id = user._id;
        const feed = await Feedback.create({
            auther: _id, // Assuming _id is the ObjectId of the user
            email: email,
            feedback: userFeedback // Assuming userFeedback is the feedback content
        });

        return res.status(200).json({message:"Success"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal Server Error"});
    }
}
async function contactus(req, res) {
    try {
        const { name, email,subject, message } = req.body;

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
      
        const mailOptions = {
          from: email,
          to: process.env.EMAIL_USER,
          subject: subject,
          html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line;">${message}</p>
          <hr>
          <p>This email was sent from the Contact Us form on your website.</p>
        `,
        };
      
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).send(error.toString());
          }
          res.status(200).send('Email sent successfully');
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal Server Error"});
    }
}
module.exports = { handlefeedback,contactus };
