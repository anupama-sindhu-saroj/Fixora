import express from "express";
import upload from "../config/multer.js";
import File from "../models/file.js";

const router = express.Router();

// Upload single file
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const newFile = new File({
      type: req.body.type || "other",  // sent in form-data
      url: req.file.path,
      userId: req.body.userId || null  // optional
    });

    await newFile.save();

    res.json({
      success: true,
      url: req.file.path,
      message: "File uploaded and saved in database!"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
