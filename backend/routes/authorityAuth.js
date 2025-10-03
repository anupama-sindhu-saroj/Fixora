import express from "express";
import cors from "cors";
import Authority from "../models/Authority.js";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../utils/mailer.js";
import bcrypt from "bcrypt";

const router = express.Router();

/** LOGIN */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const authority = await Authority.findOne({ email });
    if (!authority) {
      return res.status(400).json({ message: "Authority not found" });
    }

    const match = await bcrypt.compare(password, authority.password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({ 
      name: authority.name, 
      city: authority.city, 
      email: authority.email 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/** REQUEST OTP */
router.post("/request-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const existingAuthority = await Authority.findOne({ email });
    if (existingAuthority) return res.status(400).json({ message: "Email already registered" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });

    const otp = new Otp({ email, otp: otpCode });
    await otp.save();

    await sendOtpEmail(email, otpCode);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
});

/** VERIFY OTP & COMPLETE SIGNUP */
router.post("/verify-otp", async (req, res) => {
    const { email, name, city, otp, password, authorityCode } = req.body;
  
    try {
      // Validate OTP first
      const validOtp = await Otp.findOne({ email, otp });
      if (!validOtp) return res.status(400).json({ message: "Invalid or expired OTP" });
  
      // Check authority code
      if (authorityCode !== "5678") {
        return res.status(400).json({ message: "Invalid authority code" });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create authority
      const authority = new Authority({
        name,
        email: email.toLowerCase(),
        city,
        password: hashedPassword,
        authorityCode
      });
  
      await authority.save();
      await Otp.deleteMany({ email });
  
      res.status(201).json({ message: "Signup successful!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error verifying OTP", error: err.message });
    }
  });

/** RESET PASSWORD */
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ message: "Invalid or expired OTP" });

    const authority = await Authority.findOne({ email });
    if (!authority) return res.status(404).json({ message: "Authority not found" });

    authority.password = await bcrypt.hash(newPassword, 10);
    await authority.save();

    await Otp.deleteOne({ email });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

/** REQUEST PASSWORD RESET OTP */
router.post("/request-password-reset-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const authority = await Authority.findOne({ email });
    if (!authority) return res.status(400).json({ message: "Email not registered" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp: otpCode, createdAt: Date.now() });

    await sendOtpEmail(email, otpCode);

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/** LOGOUT */
router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  } else {
    return res.status(200).json({ message: "No session to clear" });
  }
});

export default router;
