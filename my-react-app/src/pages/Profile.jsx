import React, { useState, useEffect } from "react";
import Sidebar from "../components/shared/Sidebar";

// ─── Hardcoded fallback (shown when no user is logged in) ───────────────────
const MOCK_PROFILE = {
  citizen: {
    name: "Alex Vance",
    location: "Ward 4, Central District",
    profilePic:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    civicPoints: 2450,
  },
  summary: { totalReports: 14, resolvedCount: 9, inProgress: 3, resolutionRate: 64 },
  rank: 8,
  badges: ["Civic Legend", "Pothole Patrol", "First Response", "Quick Fixer"],
  issues: [
    {
      _id: "1",
      description: "Deep crater on Main St right next to crosswalk",
      issueType: "Pothole",
      status: "In Progress",
      date: "2 hours ago",
      imageUrls: [
        "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=300",
      ],
    },
    {
      _id: "2",
      description: "Blinking street light causing zero visibility at intersection",
      issueType: "Street Light",
      status: "Resolved",
      date: "Yesterday",
      imageUrls: [],
    },
    {
      _id: "3",
      description: "Illegal dumping of electronic waste behind park lot",
      issueType: "Trash",
      status: "Resolved",
      date: "3 days ago",
      imageUrls: [],
    },
  ],
};

// ─── Stat card config ────────────────────────────────────────────────────────
function getStats(summary) {
  return [
    {
      label: "TOTAL WORK ORDERS",
      val: summary.totalReports,
      bg: "bg-[#eef2ff]",
      fill: "text-blue-600",
      path: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      ),
    },
    {
      label: "PENDING ISSUES",
      val: summary.totalReports - summary.resolvedCount - (summary.inProgress ?? 0),
      bg: "bg-[#fef2f2]",
      fill: "text-red-500",
      path: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    {
      label: "IN PROGRESS",
      val: summary.inProgress ?? 0,
      bg: "bg-[#fffbeb]",
      fill: "text-amber-500",
      path: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18"
        />
      ),
    },
    {
      label: "TOTAL RESOLVED",
      val: summary.resolvedCount,
      bg: "bg-[#f0fdf4]",
      fill: "text-emerald-500",
      path: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
  ];
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(MOCK_PROFILE);
  const [liveTime, setLiveTime] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ── Live clock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const format = () =>
      new Date().toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    setLiveTime(format());
    const t = setInterval(() => setLiveTime(format()), 60000);
    return () => clearInterval(t);
  }, []);

  // ── Fetch profile (or use mock if not logged in) ───────────────────────────
  useEffect(() => {
    async function loadProfile() {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const citizenId = user?.id;

        if (!citizenId) {
          // No login → show hardcoded data
          setIsLoggedIn(false);
          setProfileData(MOCK_PROFILE);
          setLoading(false);
          return;
        }

        setIsLoggedIn(true);
        const res = await fetch(
          `http://localhost:5001/api/citizen-profile/byUser/${citizenId}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch");

        // Normalise — backend might not send inProgress yet
        setProfileData({
          ...data,
          summary: {
            totalReports: data.summary?.totalReports ?? 0,
            resolvedCount: data.summary?.resolvedCount ?? 0,
            inProgress: data.summary?.inProgress ?? 0,
            resolutionRate: data.summary?.resolutionRate ?? 0,
          },
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
        // On error fall back to mock
        setProfileData(MOCK_PROFILE);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // ── Photo upload ───────────────────────────────────────────────────────────
  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.id) {
      alert("Please log in to change your photo.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);
    setUploading(true);

    try {
      const res = await fetch(
        `http://localhost:5001/api/profile/upload/${user.id}`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (res.ok) {
        setProfileData((prev) => ({
          ...prev,
          citizen: { ...prev.citizen, profilePic: data.profilePic },
        }));
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch {
      alert("Server error while uploading.");
    } finally {
      setUploading(false);
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const { citizen, summary, rank, badges, issues } = profileData;
  const currentPoints = citizen.civicPoints || 0;
  const nextLevel = Math.ceil(currentPoints / 1000) * 1000 || 1000;
  const progressPct = Math.min((currentPoints / nextLevel) * 100, 100);

  const initials = citizen.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const stats = getStats(summary);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex items-center justify-center lg:ml-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading profile…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col lg:ml-64 min-w-0 overflow-y-auto">

        {/* ── Header ── */}
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-500"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                Citizen Profile
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">{liveTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Badge: mock vs live */}
            {!isLoggedIn && (
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                Demo mode
              </span>
            )}
            <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm">
              {initials}
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 p-8 space-y-6 max-w-[1600px] w-full mx-auto">

          {/* Identity card */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">

              {/* Avatar with upload overlay */}
              <div className="relative group">
                <img
                  src={citizen.profilePic}
                  alt={citizen.name}
                  className={`w-16 h-16 rounded-xl object-cover border border-gray-100 transition-opacity duration-300 ${uploading ? "opacity-50" : ""}`}
                />
                <label className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-gray-800">{citizen.name}</h1>
                  <span className="bg-blue-50 text-blue-600 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md border border-blue-100/50">
                    {isLoggedIn ? "Verified Citizen" : "Demo Account"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">{citizen.location}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Community Rank&nbsp;
                  <span className="font-bold text-gray-600">#{rank}</span>
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full md:w-80 space-y-2 bg-slate-50/60 p-4 rounded-xl border border-slate-100/80">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>Civic Progress</span>
                <span className="text-slate-700">
                  {currentPoints.toLocaleString()} / {nextLevel.toLocaleString()} CP
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200/70 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {nextLevel - currentPoints} points to next level
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center gap-4"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.fill} flex items-center justify-center shrink-0`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {stat.path}
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider block">
                    {stat.label}
                  </span>
                  <span className={`text-2xl font-black tracking-tight ${stat.fill} block mt-0.5`}>
                    {stat.val}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Two-column: history + badges */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* History records */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-6 lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Your History Records</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tracked log of reported local anomalies
                </p>
              </div>

              {issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-400">No reports yet</p>
                  <p className="text-xs text-gray-300 mt-1">Issues you report will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto pr-1">
                  {issues.map((issue) => (
                    <div
                      key={issue._id}
                      className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {issue.imageUrls?.[0] ? (
                          <img
                            src={issue.imageUrls[0]}
                            alt="Issue"
                            className="w-11 h-11 rounded-lg object-cover border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">
                            {issue.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold text-[9px] uppercase tracking-wider">
                              {issue.issueType}
                            </span>
                            <span>•</span>
                            <span>{issue.date || "Just now"}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
                          issue.status === "Resolved"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                            : issue.status === "In Progress"
                            ? "bg-amber-50 border-amber-100 text-amber-600"
                            : "bg-red-50 border-red-100 text-red-500"
                        }`}
                      >
                        {issue.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Earned Badges</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Community milestone markers unlocked
                </p>
              </div>

              {badges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-gray-300 font-medium">No badges yet</p>
                  <p className="text-xs text-gray-200 mt-1">Keep reporting to earn them!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {badges.map((badge, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100/60 text-blue-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{badge}</p>
                        <p className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest mt-0.5">
                          Achieved
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Resolution rate card (bonus stat at bottom) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-800">Resolution Rate</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Percentage of your reports that have been resolved
              </p>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-center">
                <p className="text-3xl font-black text-blue-600">{summary.resolutionRate}%</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                  Rate
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-emerald-500">{summary.resolvedCount}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                  Resolved
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-gray-700">{summary.totalReports}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                  Total
                </p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
