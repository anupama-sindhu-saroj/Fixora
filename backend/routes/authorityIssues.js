import express from "express";
import Issue from "../models/Issue.js"; // make sure same model your friend uses
const router = express.Router();

/** Get all issues for authority view */
router.get("/all", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Error fetching issues", error: err.message });
  }
});

/** Submit a solution for a specific issue */
router.put("/resolve/:id", async (req, res) => {
  try {
    const { summary, department, resolvedImageUrl } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        status: "Resolved",
        solution: {
          summary,
          department,
          resolvedImageUrl,
          resolvedAt: Date.now(),
        },
      },
      { new: true }
    );

    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json({ message: "Solution submitted successfully", issue });
  } catch (err) {
    res.status(500).json({ message: "Error submitting solution", error: err.message });
  }
});

export default router;
