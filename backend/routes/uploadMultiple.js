// uploadMultiple.js
import express from "express";
import upload from "../config/multer.js";
import File from "../models/file.js";

const router = express.Router();

// Upload multiple files
router.post("/", upload.array("files", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "No files uploaded" });
    }

    const savedFiles = await Promise.all(req.files.map(file => {
      const newFile = new File({
        type: "other",
        url: file.path,
        userId: req.body.userId || null
      });
      return newFile.save();
    }));

    res.json({
      success: true,
      urls: savedFiles.map(f => f.url),
      message: "Files uploaded and saved in database!"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
