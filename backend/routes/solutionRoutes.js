import express from "express";
import Solution from "../models/Solution.js";
import Issue from "../models/Issue.js";
import upload from "../config/multer.js";
import authMiddleware from "../middleware/authMiddleware.js";
import mongoose from "mongoose";
const router = express.Router();

// POST → Submit a new solution for an issue
router.post("/:issueId", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { issueId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ error: "Invalid issue ID format" });
    }
    const { summary, department } = req.body;

    // Check if the issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    // Create the solution document
    const newSolution = new Solution({
      issueId,
      summary,
      department,
      resolvedBy: req.userId, // authority id from JWT
      imageUrl: req.file ? req.file.path : null,
    });

    await newSolution.save();

    // Update issue status to "Resolved"
    issue.status = "Resolved";
    await issue.save();

    res.status(201).json({
      message: "✅ Solution submitted successfully",
      solution: newSolution,
    });
  } catch (err) {
    console.error("Error saving solution:", err);
    res.status(500).json({ error: "Server error while saving solution" });
  }
});

// GET → Fetch all solutions
router.get("/", async (req, res) => {
  try {
    const solutions = await Solution.find()
      .populate("issueId", "issueType description location status")
      .populate("resolvedBy", "name email");
    res.json(solutions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
