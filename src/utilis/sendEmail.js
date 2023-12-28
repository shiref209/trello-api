import nodemailer from "nodemailer";
import "dotenv/config";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  const info = await transporter
    .sendMail({
      from: `"Trello team" <${process.env.EMAIL}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    })
    .catch((error) => {
      console.log("send email error");
      console.log(error);
    });
  return info;
};
export default sendEmail;
