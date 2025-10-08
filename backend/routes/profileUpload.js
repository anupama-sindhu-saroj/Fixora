import express from "express";
import upload from "../config/multer.js";
import CitizenProfile from "../models/citizenprofile.js";

const router = express.Router();

/**
 * 📸 Upload or update profile picture
 * POST /api/profile/upload/:userId
 */
router.post("/upload/:userId", upload.single("profilePic"), async (req, res) => {
  try {
    const { userId } = req.params;

    // 🧩 Validation
    if (!userId) {
      return res.status(400).json({ error: "Missing userId in request params" });
    }
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // ✅ Cloudinary returns secure URL in `req.file.path`
    const imageUrl = req.file.path;

    // ✅ Update or create citizen profile if missing
    const updatedProfile = await CitizenProfile.findOneAndUpdate(
      { userId },
      { profilePic: imageUrl },
      { new: true, upsert: false } // don't auto-create; user profile should exist
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: "Citizen profile not found" });
    }

    console.log(`📸 Updated profile photo for user ${userId}`);

    return res.status(200).json({
      message: "✅ Profile photo updated successfully!",
      profilePic: imageUrl,
    });
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error.message);
    return res.status(500).json({
      error: "Internal server error while uploading profile photo",
      details: error.message,
    });
  }
});

export default router;
