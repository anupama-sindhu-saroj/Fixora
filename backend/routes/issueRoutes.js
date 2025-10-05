import express from "express";
import Issue from "../models/Issue.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// POST → Submit a new issue
router.post("/", authMiddleware, async (req, res) => {
    try {
      const { issueType, description, location, imageUrls } = req.body;
  
      if (!issueType || !description || !location) {
        return res.status(400).json({ error: "All required fields must be filled" });
      }
  
      const issue = new Issue({
        issueType,
        description,
        location,
        imageUrls,
        reportedBy: req.citizenId, // Automatically store logged-in citizen ID
      });
  
      await issue.save();
  
      res.status(201).json({ message: "Issue reported successfully", issue });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

// GET → Fetch all issues
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
