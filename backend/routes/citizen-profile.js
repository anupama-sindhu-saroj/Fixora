import express from "express";
import Citizen from "../models/Citizen.js";
import CitizenProfile from "../models/citizenprofile.js";
import Issue from "../models/issue.js";

const router = express.Router();

/**
 * 👤 Get profile by User ID (auto-create if missing)
 * Includes Civic Points + Rank + Summary
 */
router.get("/byUser/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1️⃣ Find profile or create it
    let citizen = await CitizenProfile.findOne({ userId });

    if (!citizen) {
      const user = await Citizen.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      citizen = await CitizenProfile.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified || false,
      });
      console.log(`✅ Auto-created profile for ${user.email}`);
    }

    // 2️⃣ Fetch user’s issues
    const issues = await Issue.find({ reportedBy: userId }).sort({ createdAt: -1 });

    const totalReports = issues.length;
    const resolvedCount = issues.filter(i => i.status === "Resolved").length;
    const inProgressCount = issues.filter(i =>
      ["Under Review", "In Progress"].includes(i.status)
    ).length;
    const submittedCount = issues.filter(i =>
      ["Pending", "Submitted"].includes(i.status)
    ).length;
    const resolutionRate =
      totalReports > 0 ? ((resolvedCount / totalReports) * 100).toFixed(1) : 0;

    // 3️⃣ Calculate civic points
    let civicPoints = totalReports * 100 + resolvedCount * 200 + inProgressCount * 50;
    if (citizen.verified) civicPoints += 250;

    const accountAgeDays = Math.floor(
      (Date.now() - new Date(citizen.createdAt)) / (1000 * 60 * 60 * 24)
    );
    civicPoints += Math.min(accountAgeDays, 100);

    // Save updated civic points
    if (citizen.civicPoints !== civicPoints) {
      citizen.civicPoints = civicPoints;
      await citizen.save();
    }

    // 4️⃣ Efficient rank calculation
    const rank =
      (await CitizenProfile.countDocuments({ civicPoints: { $gt: civicPoints } })) + 1;

    if (citizen.rank !== rank) {
      citizen.rank = rank;
      await citizen.save();
    }

    // 5️⃣ Badges
    const badges = [];
    if (resolvedCount >= 100) badges.push("🏆 Civic Champion");
    if (totalReports >= 25) badges.push("🚧 Pothole Patroller");
    const issueTypes = issues.map(i => i.issueType?.toLowerCase());
    if (issueTypes.includes("lighting")) badges.push("💡 City Illuminator");
    if (issueTypes.includes("water")) badges.push("🌊 Monsoon Hero");
    if (issueTypes.includes("waste")) badges.push("🧹 Clean City Star");

    // ✅ Return all computed data
    return res.status(200).json({
      citizen,
      summary: {
        totalReports,
        resolvedCount,
        inProgressCount,
        submittedCount,
        resolutionRate,
      },
      civicPoints,
      rank,
      badges,
      issues,
    });
  } catch (error) {
    console.error("❌ Citizen Profile Error:", error);
    return res.status(500).json({ error: "Failed to fetch citizen profile" });
  }
});

export default router;
