const nodemailer = require("nodemailer");
const template = require("./emailTemplate");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});


const sendEmail = async (to,subject,code,name,text="") =>  {
    try {
    const info = await transporter.sendMail({
        from: process.env.USER_EMAIL,
        to,
        subject,
        text,
        html:template(code,name,subject),
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
    console.error("Error while sending mail:", err);
    }
}

module.exports = sendEmail