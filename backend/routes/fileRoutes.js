// routes/fileRoutes.js
import express from "express";
import File from "../models/file.js";

const router = express.Router();

// GET files by type, e.g., logo
router.get("/", async (req, res) => {
  try {
    const type = req.query.type; // type=logo
    if (!type) return res.status(400).json({ success: false, message: "Type is required" });

    const files = await File.find({ type }).sort({ createdAt: -1 }); // latest first
    if (files.length === 0) return res.json([]); // return empty array if none found

    res.json(files); // return array of files
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
