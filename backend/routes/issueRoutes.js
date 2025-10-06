import express from "express";
import Issue from "../models/Issue.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";
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
      
      // Emit to all connected clients
      const io = req.app.get("io");
      io.emit("newIssue", issue);

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

router.get("/summary", async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const pending = await Issue.countDocuments({ status: "Pending" });
    const inProgress = await Issue.countDocuments({ status: "In Progress" });
    const resolved = await Issue.countDocuments({ status: "Resolved" }); // total resolved

    res.json({
      total,
      pending,
      inProgress,
      resolved, // renamed from resolvedToday
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch summary data" });
  }
});




// ✅ ADD THIS NEW ROUTE (for modal details)
router.get("/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });
    res.json(issue);
  } catch (err) {
    console.error("Error fetching issue:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ PATCH → Mark issue as "In Progress" when viewed by authority
router.patch("/:id/progress", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    // Only change if not already resolved
    if (issue.status !== "Resolved") {
      issue.status = "In Progress";
      await issue.save();
    }

    res.json({ message: "Issue status updated", status: issue.status });
  } catch (err) {
    console.error("Error updating progress:", err);
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

// ✅ ADD THIS NEW ROUTE (for popup image + text upload)
router.post("/:id/solution", upload.single("image"), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    issue.solution = {
      summary: req.body.text || "No summary provided",
      resolvedAt: new Date(),
    };
    if (req.file) issue.solutionImage = req.file.path;
    issue.status = "Resolved";

    await issue.save();
    res.json({ message: "Solution saved successfully", issue });
  } catch (err) {
    console.error("Error saving solution:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
