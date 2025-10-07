import express from "express";
import Issue from "../models/issue.js";
import Solution from "../models/solution.js";

const router = express.Router();

// 🕒 Utility: Get start date based on date filter
function getDateRange(range) {
  const now = new Date();
  let start;
  if (range === "7days") start = new Date(now.setDate(now.getDate() - 7));
  else if (range === "30days") start = new Date(now.setDate(now.getDate() - 30));
  else if (range === "year") start = new Date(now.getFullYear(), 0, 1);
  else start = new Date(0);
  return start;
}

// 📊 GET /api/analytics
router.get("/", async (req, res) => {
  try {
    const { dateRange = "30days", location = "all", status = "all" } = req.query;
    const startDate = getDateRange(dateRange);

    // 🔹 Step 1: Fetch filtered issues
    const filter = { createdAt: { $gte: startDate } };
    if (location !== "all") filter.location = location;
    if (status !== "all") filter.status = status;

    const issues = await Issue.find(filter);
    const totalIssues = issues.length;

    // 🔹 Step 2: Count status types
    const pendingCount = issues.filter(i => i.status === "Pending").length;
    const resolvedCount = issues.filter(i => i.status === "Resolved").length;
    const reviewCount = issues.filter(i => i.status === "Under Review").length;

    // 🔹 Step 3: Calculate average resolution time (in hours)
    const solutions = await Solution.find({
      resolvedAt: { $gte: startDate },
    }).populate("issueId", "createdAt");

    const avgResolveTime =
      solutions.length > 0
        ? (
            solutions.reduce((acc, s) => {
              const diff = new Date(s.resolvedAt) - new Date(s.issueId.createdAt);
              return acc + diff / (1000 * 60 * 60); // convert ms to hours
            }, 0) / solutions.length
          ).toFixed(1)
        : 0;

    // 🔹 Step 4: Issues by category (pie chart)
    const categoryCount = {};
    issues.forEach(i => {
      categoryCount[i.issueType] = (categoryCount[i.issueType] || 0) + 1;
    });

    // 🔹 Step 5: Department performance (bar chart)
    const deptAgg = await Solution.aggregate([
      {
        $group: {
          _id: "$department",
          avgTime: { $avg: { $subtract: ["$resolvedAt", "$$NOW"] } },
          count: { $sum: 1 },
        },
      },
    ]);

    const departmentNames = deptAgg.map(d => d._id);
    const departmentPerformance = deptAgg.map(d =>
      (d.avgTime / (1000 * 60 * 60 * 24)).toFixed(1) // convert ms → days
    );

    // 🔹 Step 6: Weekly issue trend (line chart)
    const weekAgg = await Issue.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    const weeklyLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyCounts = Array(7).fill(0);
    weekAgg.forEach(w => {
      weeklyCounts[w._id - 1] = w.count;
    });

    // 🔹 Step 7: AI-style insight message
    let insightMessage;
    if (resolvedCount > pendingCount)
      insightMessage = "💡 Great! More issues are being resolved than pending this month.";
    else if (pendingCount > resolvedCount)
      insightMessage = "⚠️ Pending issues are rising. Consider improving response time.";
    else insightMessage = "📈 Stable issue resolution trend this month.";

    // 🔹 Step 8: Send JSON response
    res.json({
      totalIssues,
      pending: pendingCount,
      resolved: resolvedCount,
      underReview: reviewCount,
      avgResolveTime,
      categoryCount,
      departmentNames,
      departmentPerformance,
      weeklyLabels,
      weeklyCounts,
      insightMessage,
    });
  } catch (error) {
    console.error("❌ Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

// ✅ Correct Export
export default router;
