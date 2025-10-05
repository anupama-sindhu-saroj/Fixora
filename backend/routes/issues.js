import express from "express";
import Issue from "../models/Issue.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------------------
   POST → Submit a new issue (Citizen)
---------------------------------------- */
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
      status: "Unassigned",
    });

    await issue.save();

    res.status(201).json({ message: "Issue reported successfully", issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ----------------------------------------
   GET → Fetch all issues (Authority)
---------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ----------------------------------------
   PUT → Resolve an existing issue (Authority)
---------------------------------------- */
router.put("/:id/resolve", async (req, res) => {
  try {
    const { id } = req.params;
    const { solutionSummary, department } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    issue.status = "Resolved";
    issue.solutionSummary = solutionSummary;
    issue.resolvedBy = department;
    issue.resolvedAt = new Date();

    await issue.save();

    res.status(200).json({ message: "✅ Issue marked as resolved", issue });
  } catch (err) {
    console.error("Error resolving issue:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
