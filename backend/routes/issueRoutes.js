import express from "express";
import Issue from "../models/Issue.js";
import authMiddleware from "../middleware/authMiddleware.js";
import IssueLocation from "../models/IssueLocation.js";
import upload from "../config/multer.js";
import Solution from "../models/Solution.js";
const router = express.Router();
console.log("✅ IssueLocation Model Loaded:", typeof IssueLocation.findOne);
// POST → Submit a new issue
router.post("/", authMiddleware, async (req, res) => {
    try {
      const { issueType, description, location, imageUrls, latitude, longitude } = req.body;
  
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
      console.log("✅ Issue saved:", issue);

      // Save location if present
      if (latitude && longitude) {
        const issueLocation = new IssueLocation({
          issueId: issue._id,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        });
        await issueLocation.save();
        console.log("✅ IssueLocation saved:", issueLocation);
      } else {
        console.log("⚠ Latitude or Longitude missing, skipping location save");
      }
      // ✅ Emit issue WITH coordinates for live map
        const io = req.app.get("io");
        io.emit("newIssue", {
          ...issue.toObject(),
          locationCoords:
            latitude && longitude
              ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
              : null,
        });


      res.status(201).json({ message: "Issue reported successfully", issue });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
  router.get("/with-locations", async (req, res) => {
  console.log("📍 [DEBUG] /with-locations route called");

  try {
    const issues = await Issue.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    console.log("✅ Found", issues.length, "issues");

    const results = [];

    for (const issue of issues) {
      try {
        console.log("🔍 Searching location for issue:", issue._id);
        const loc = await IssueLocation.findOne({ issueId: issue._id });
        console.log("📍 Location found:", loc);

        results.push({
          ...issue.toObject(),
          locationCoords: loc
            ? { lat: loc.latitude, lng: loc.longitude }
            : null,
        });
      } catch (innerErr) {
        console.error("⚠️ Error finding location for", issue._id, ":", innerErr.message);
        results.push({ ...issue.toObject(), locationCoords: null });
      }
    }

    console.log("✅ Sending", results.length, "issues with coords");
    res.status(200).json(results);

  } catch (err) {
    console.error("❌ /with-locations failed:", err.message);
    console.error(err.stack);
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

router.get("/pending", async (req, res) => {
  try {
    // Find pending issues
    const pendingIssues = await Issue.find({ status: "Pending" });

    // Map each issue with its location
    const issuesWithLocation = await Promise.all(
      pendingIssues.map(async (issue) => {
        const location = await IssueLocation.findOne({ issueId: issue._id });
        return {
          ...issue.toObject(),
          location: location ? {
            lat: location.latitude,
            lng: location.longitude,
          } : null,
        };
      })
    );

    res.status(200).json(issuesWithLocation);
  } catch (err) {
    console.error("Error fetching pending issues:", err);
    res.status(500).json({ error: "Failed to fetch pending issues" });
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
