const nodemailer = require("nodemailer");

 async function sendEmail (to, subject, html) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
     auth: {
                user: process.env.EMAIL_USER, // Use environment variables for security
                pass: process.env.EMAIL_PASS
            }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
};

module.exports = sendEmail;
