import express from "express";
import Citizen from "../models/Citizen.js"
import citizenprofile from "../models/citizenprofile.js";
import Issue from "../models/issue.js";

const router = express.Router();

// ✅ Get profile by User ID instead of Profile ID
router.get("/byUser/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    let citizen = await citizenprofile.findOne({ userId });

// 🧠 Auto-create if profile is missing
if (!citizen) {
  const user = await Citizen.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  citizen = await citizenprofile.create({
    userId: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified || false,
  });
  console.log(`✅ Auto-created profile for ${user.email}`);
}


    const issues = await Issue.find({ reportedBy: userId }).sort({ createdAt: -1 });

    const totalReports = issues.length;
    const resolvedCount = issues.filter(i => i.status === "Resolved").length;
    const inProgressCount = issues.filter(i => ["Under Review", "In Progress"].includes(i.status)).length;
    const submittedCount = issues.filter(i => ["Pending", "Submitted"].includes(i.status)).length;

    const resolutionRate = totalReports > 0 ? ((resolvedCount / totalReports) * 100).toFixed(1) : 0;

    const badges = [];
    if (resolvedCount >= 100) badges.push("🏆 Civic Champion");
    if (totalReports >= 25) badges.push("🚧 Pothole Patroller");
    if (issues.some(i => i.issueType === "Lighting")) badges.push("💡 City Illuminator");
    if (issues.some(i => i.issueType === "Water")) badges.push("🌊 Monsoon Hero");
    if (issues.some(i => i.issueType === "Waste")) badges.push("🧹 Clean City Star");

    res.json({
      citizen,
      summary: { totalReports, resolvedCount, inProgressCount, submittedCount, resolutionRate },
      badges,
      issues,
    });
  } catch (error) {
    console.error("❌ Citizen Profile Error:", error);
    res.status(500).json({ error: "Failed to fetch citizen profile" });
  }
});


export default router;
