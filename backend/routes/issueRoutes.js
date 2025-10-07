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
        reportedBy: req.userId // Automatically store logged-in citizen ID
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
/* ---------------------------------------------------------
   2️⃣ Fetch All Issues (Authority Dashboard / Map)
--------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

/* ---------------------------------------------------------
   5️⃣ Resolve an Issue (Authority Submits a Solution)
--------------------------------------------------------- */
router.put("/:id/resolve", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { summary, department } = req.body;

    // ✅ Only authorities can resolve
    if (req.userRole !== "authority") {
      return res.status(403).json({ error: "Only authorities can resolve issues" });
    }

    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    // ✅ Create new Solution document
    const solution = new Solution({
      issueId: id,
      summary,
      department,
      resolvedBy: req.userId,
      imageUrl: req.file ? req.file.path : null,
    });

    await solution.save();

    // ✅ Update issue’s status
    issue.status = "Resolved";
    issue.resolvedAt = new Date();
    await issue.save();

    res.status(200).json({
      message: "✅ Solution submitted successfully",
      issue,
      solution,
    });
  } catch (err) {
    console.error("Error resolving issue:", err);
    res.status(500).json({ error: err.message });
  }
});
export default router;