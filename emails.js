const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-password",
  },
});

function sendEmail(to, subject, text) {
  const mailOptions = {
    from: "your-email@gmail.com",
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error(error);
    }
    console.log("Email sent:", info.response);
  });
}

module.exports = { sendEmail };
