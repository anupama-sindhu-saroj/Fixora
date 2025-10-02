import express from "express";
import cors from "cors";
import Citizen from "../models/Citizen.js";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../utils/mailer.js";

const router = express.Router();
/** LOGIN */
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
      const user = await Citizen.findOne({
          $or: [
              { email: emailOrUsername },
              { username: emailOrUsername }
          ]
      });

      if (!user) {
          return res.status(400).json({ message: "User not found" });
      }

      if (user.password !== password) {
          return res.status(401).json({ message: "Incorrect password" });
      }

      res.status(200).json({ name: user.name, username: user.username });
  } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
  }
});

/** REQUEST OTP */
router.post("/request-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const existingCitizen = await Citizen.findOne({ email });
    if (existingCitizen) return res.status(400).json({ message: "Email already registered" });

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
/** VERIFY OTP & COMPLETE SIGNUP */
router.post("/verify-otp", async (req, res) => {
  const { email, otp, password, name, username } = req.body;

  try {
    const validOtp = await Otp.findOne({ email: email.toLowerCase(), otp });
    if (!validOtp) return res.status(400).json({ message: "Invalid or expired OTP" });

    const usernameExists = await Citizen.findOne({ username });
    if (usernameExists) return res.status(400).json({ message: "Username already taken" });

    const citizen = new Citizen({
      email: email.toLowerCase(),
      password,
      name,
      username,
      verified: true
    });

    await citizen.save();
    await Otp.deleteMany({ email });

    res.status(201).json({ message: "Signup successful and email verified!" });
  } catch (err) {
    res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
});

/** RESET PASSWORD */
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const citizen = await Citizen.findOne({ email });
    if (!citizen) {
      return res.status(404).json({ message: "User not found" });
    }

    citizen.password = newPassword;
    await citizen.save();

    await Otp.deleteOne({ email });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

/** REQUEST PASSWORD RESET OTP */
router.post("/request-password-reset-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const citizen = await Citizen.findOne({ email });
    if (!citizen) return res.status(400).json({ message: "Email not registered" });

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
  console.log("Logout route hit");

  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Logout failed" });
      }

      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  } else {
    console.warn("⚠️ No session found");
    return res.status(200).json({ message: "No session to clear" });
  }
});

export default router;
