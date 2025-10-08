import express from "express";
import Issue from "../models/Issue.js";
import authMiddleware from "../middleware/authMiddleware.js";
import IssueLocation from "../models/IssueLocation.js";

const router = express.Router();

/* ----------------------------------------
   POST → Submit a new issue (Citizen)
---------------------------------------- */
router.post("/", authMiddleware, async (req, res) => {
  console.log("POST /api/issues called with:", req.body);
  console.log("Latitude:", req.body.latitude);
  console.log("Longitude:", req.body.longitude);
  try {
    const { issueType, description, location,latitude, longitude, imageUrls } = req.body;
    console.log("Latitude:", latitude);                  // ← ADD THIS
    console.log("Longitude:", longitude); 
    if (!issueType || !description || !location) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    const issue = new Issue({
      issueType,
      description,
      location,
      imageUrls,
      reportedBy: req.userId, // Automatically store logged-in citizen ID
      status: "Unassigned",
    });

    await issue.save();
    console.log("✅ Issue saved:", issue);
    if (latitude && longitude) {
      const issueLocation = new IssueLocation({
        issueId: issue._id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      await issueLocation.save();
      console.log("✅ IssueLocation saved:", issueLocation);
    }else {
      console.log("⚠ Latitude or Longitude missing, skipping location save");
    }

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
