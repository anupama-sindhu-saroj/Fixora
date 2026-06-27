import express from "express";
import Issue from "../models/Issue.js";
import Solution from "../models/Solution.js";
import Citizen from "../models/Citizen.js";

const router = express.Router();

// ── Utility: date range ───────────────────────────────────────────────────────
function getStartDate(range) {
  const now = new Date();
  if (range === "7days")  return new Date(now.setDate(now.getDate() - 7));
  if (range === "30days") return new Date(now.setDate(now.getDate() - 30));
  if (range === "year")   return new Date(now.getFullYear(), 0, 1);
  return new Date(0);
}

// ── GET /api/analytics ────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { dateRange = "30days", location = "All locations", status = "All statuses" } = req.query;
    const startDate = getStartDate(dateRange);

    // ── Build issue filter ──────────────────────────────────────────────────
    const filter = { createdAt: { $gte: startDate } };

    if (location && location !== "All locations") filter.location = location;
    if (status && status !== "All statuses") {
      const statusMap = {
        "Unresolved":   "Pending",
        "Under review": "Under Review",
        "Resolved":     "Resolved",
      };
      filter.status = statusMap[status] || status;
    }

    const issues = await Issue.find(filter);
    const totalIssues = issues.length;

    // ── Status counts ───────────────────────────────────────────────────────
    const pendingCount  = issues.filter(i => i.status === "Pending").length;
    const resolvedCount = issues.filter(i => i.status === "Resolved").length;
    const reviewCount   = issues.filter(i => i.status === "Under Review").length;
    const inProgress    = issues.filter(i => i.status === "In Progress").length;

    // ── Avg resolution time (hours) ─────────────────────────────────────────
    const solutions = await Solution.find({
      resolvedAt: { $exists: true, $gte: startDate },
    }).populate("issueId", "createdAt");

    const validSolutions = solutions.filter(s => s.issueId?.createdAt);
    const avgResolveTime =
      validSolutions.length > 0
        ? (
            validSolutions.reduce((acc, s) => {
              const diff = new Date(s.resolvedAt) - new Date(s.issueId.createdAt);
              return acc + diff / (1000 * 60 * 60);
            }, 0) / validSolutions.length
          ).toFixed(1)
        : 0;

    // ── Category breakdown (pie chart) ──────────────────────────────────────
    const categoryCount = {};
    issues.forEach(i => {
      if (i.issueType) {
        categoryCount[i.issueType] = (categoryCount[i.issueType] || 0) + 1;
      }
    });

    // ── Department performance (bar chart) ──────────────────────────────────
    const deptAgg = await Solution.aggregate([
      {
        $lookup: {
          from: "issues",
          localField: "issueId",
          foreignField: "_id",
          as: "issue",
        },
      },
      // FIX: was "preserveNullAndEmpty" (invalid) → correct option name
      { $unwind: { path: "$issue", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: "$department",
          resolvedCount: { $sum: 1 },
          avgTime: {
            $avg: { $subtract: ["$resolvedAt", "$issue.createdAt"] },
          },
        },
      },
      { $sort: { resolvedCount: -1 } },
    ]);

    const pendingByDept = {};
    issues
      .filter(i => i.status === "Pending" || i.status === "Under Review")
      .forEach(i => {
        const key = i.department || i.issueType || "Other";
        pendingByDept[key] = (pendingByDept[key] || 0) + 1;
      });

    const departmentNames       = deptAgg.map(d => d._id || "Unknown");
    const departmentPerformance = deptAgg.map(d => d.resolvedCount);
    const departmentPending     = deptAgg.map(d => pendingByDept[d._id] || 0);

    // ── Weekly trend (area chart) ────────────────────────────────────────────
    const weekAgg = await Issue.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1=Sun … 7=Sat
          count: { $sum: 1 },
        },
      },
    ]);

    const weeklyLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyCounts = Array(7).fill(0);
    weekAgg.forEach(w => { weeklyCounts[w._id - 1] = w.count; });

    // ── Citizen engagement ───────────────────────────────────────────────────
    let activeUsers = 0;
    let topReporter = "N/A";
    let avgRating   = 0;

    try {
      const activeReporters = await Issue.distinct("reportedBy", {
        createdAt: { $gte: startDate },
      });
      activeUsers = activeReporters.length;

      const topAgg = await Issue.aggregate([
        { $match: { createdAt: { $gte: startDate }, reportedBy: { $exists: true } } },
        { $group: { _id: "$reportedBy", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: "citizens",
            localField: "_id",
            foreignField: "_id",
            as: "citizen",
          },
        },
        // FIX: was "preserveNullAndEmpty" (invalid) → correct option name
        { $unwind: { path: "$citizen", preserveNullAndEmptyArrays: true } },
      ]);

      if (topAgg.length > 0) {
        // FIX: was topAgg[0].count (wrong field) → use ._id for citizen identifier
        topReporter = topAgg[0].citizen?.name || `Citizen #${String(topAgg[0]._id).slice(-4)}`;
      }

      const ratingAgg = await Citizen.aggregate([
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]);
      avgRating = ratingAgg[0]?.avg ? ratingAgg[0].avg.toFixed(1) : 4.2;
    } catch (e) {
      console.warn("Citizen stats skipped:", e.message);
    }

    // ── Insight message ──────────────────────────────────────────────────────
    let insightMessage;
    if (totalIssues === 0) {
      insightMessage = "📭 No issues reported in this period yet.";
    } else if (resolvedCount > pendingCount) {
      insightMessage = `💡 Great! ${resolvedCount} issues resolved vs ${pendingCount} pending this period.`;
    } else if (pendingCount > resolvedCount) {
      insightMessage = `⚠️ ${pendingCount} issues still pending. Response time needs attention.`;
    } else {
      insightMessage = "📈 Stable issue resolution trend this period.";
    }

    // ── Response ─────────────────────────────────────────────────────────────
    res.json({
      totalIssues,
      pending:     pendingCount,
      resolved:    resolvedCount,
      underReview: reviewCount,
      inProgress,
      avgResolveTime,
      categoryCount,
      departmentNames,
      departmentPerformance,
      departmentPending,
      weeklyLabels,
      weeklyCounts,
      activeUsers,
      avgRating,
      topReporter,
      insightMessage,
    });
  } catch (error) {
    // FIX: log full error details so future issues are easier to diagnose
    console.error("❌ Analytics error:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
});

export default router;