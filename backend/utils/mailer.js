import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
console.log("Mailer using:", process.env.EMAIL_USER, process.env.EMAIL_PASS ? "✅ loaded" : "❌ missing");
export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

export const sendOtpEmail = (email, otp) => {
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Fixora",
        html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`
    });
};
