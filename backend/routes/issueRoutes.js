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

// PUT → Submit a solution or update issue status
router.put("/:id/resolve", async (req, res) => {
  try {
    const { solutionSummary, department } = req.body;

    if (!solutionSummary || !department) {
      return res.status(400).json({ error: "Please provide solution summary and department" });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    issue.status = "Resolved";
    issue.solution = {
      summary: solutionSummary,
      department,
      resolvedAt: new Date(),
    };

    await issue.save();
    res.status(200).json({ message: "✅ Solution submitted successfully", issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
