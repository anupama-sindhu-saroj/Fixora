import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/shared/Sidebar";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from "recharts";

const DATE_OPTS = [
  { label: "Last 7 days",  value: "7days"  },
  { label: "Last 30 days", value: "30days" },
  { label: "This year",    value: "year"   },
];
const LOC_OPTS    = ["All locations", "Ward 1", "Ward 2", "Central"];
const STATUS_OPTS = ["All statuses", "Unresolved", "Under review", "Resolved"];

const FALLBACK = {
  avgResolveTime:        4,
  pending:               12,
  resolved:              38,
  underReview:           7,
  inProgress:            3,
  activeUsers:           452,
  avgRating:             4.3,
  topReporter:           "Citizen #908",
  insightMessage:        "This month saw a 20% increase in road-related issues.",
  categoryCount:         { Pothole: 38, "Street light": 22, Trash: 18, Graffiti: 15, Other: 7 },
  weeklyLabels:          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  weeklyCounts:          [5, 12, 19, 9, 24, 17, 8],
  departmentNames:       ["Roads", "Lighting", "Sanitation", "Parks"],
  departmentPerformance: [48, 30, 22, 18],
  departmentPending:     [12, 8, 15, 4],
};

const PIE_COLORS = ["#f59e0b", "#6366f1", "#0d9488", "#ec4899", "#94a3b8"];

function buildKpiCards(data) {
  return [
    { label: "AVG RESOLVE TIME", value: `${data.avgResolveTime ?? 0} hrs`, bg: "#f0f5ff", color: "#2563eb", icon: "⚡" },
    { label: "PENDING ISSUES",   value: data.pending      ?? 0,            bg: "#fef2f2", color: "#ef4444", icon: "🕒" },
    { label: "TOTAL RESOLVED",   value: data.resolved     ?? 0,            bg: "#f0fdf4", color: "#22c55e", icon: "✅" },
    { label: "UNDER REVIEW",     value: data.underReview  ?? 0,            bg: "#fffbeb", color: "#d97706", icon: "🔄" },
  ];
}

function LightTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: 10, padding: "8px 14px", fontSize: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}>
      <p style={{ color: "#aaa", marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color ?? "#2563eb", fontWeight: 700 }}>
          {p.value} {p.name}
        </p>
      ))}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl p-5 ${className}`}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      {children}
    </div>
  );
}

function CardTitle({ title, sub }) {
  return (
    <>
      <p className="text-sm font-bold text-gray-800 mb-0.5">{title}</p>
      <p className="text-xs text-gray-400 mb-4">{sub}</p>
    </>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`rounded-xl bg-gray-100 animate-pulse ${className}`} />;
}

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [dateFilter,   setDateFilter]   = useState("30days");
  const [locFilter,    setLocFilter]    = useState("All locations");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [liveTime,     setLiveTime]     = useState("");
  const [analytics,    setAnalytics]    = useState(null);
  const [isOffline,    setIsOffline]    = useState(false);
  // FIX: separate loading state so filter changes show a spinner
  // without wiping out the whole page
  const [loading,      setLoading]      = useState(false);

  // Live clock
  useEffect(() => {
    const tick = () =>
      setLiveTime(new Date().toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long",
        day: "numeric", hour: "2-digit", minute: "2-digit",
      }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // FIX: fetchAnalytics now uses a loading flag instead of wiping analytics to
  // null on every filter change — this prevents the whole UI from blanking out
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateRange: dateFilter,
        location:  locFilter,
        status:    statusFilter,
      });
      console.log("Fetching analytics with:", Object.fromEntries(params)); // debug
      const res = await fetch(`http://localhost:5001/api/analytics?${params}`);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Backend error:", errBody);       // shows real error message
        throw new Error(`HTTP ${res.status}: ${errBody.error || "unknown"}`);
      }
      const data = await res.json();
      setAnalytics(data);
      setIsOffline(false);
    } catch (err) {
      console.error("Analytics fetch failed:", err.message);
      setIsOffline(true);
      setAnalytics(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, locFilter, statusFilter]);

  // FIX: don't wipe analytics to null here — use the loading flag instead
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // 30-second auto-refresh
  useEffect(() => {
    const id = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(id);
  }, [fetchAnalytics]);

  const d = analytics ?? FALLBACK;

  const pieData  = Object.entries(d.categoryCount ?? {}).map(([name, value]) => ({ name, value }));
  const pieTotal = pieData.reduce((s, x) => s + x.value, 0);

  const lineData = (d.weeklyLabels ?? []).map((day, i) => ({
    day,
    issues: (d.weeklyCounts ?? [])[i] ?? 0,
  }));

  const deptData = (d.departmentNames ?? []).map((dept, i) => ({
    dept,
    resolved: (d.departmentPerformance ?? [])[i] ?? 0,
    pending:  (d.departmentPending     ?? [])[i] ?? 0,
  }));

  const kpiCards = buildKpiCards(d);

  const citizenStats = [
    { emoji: "👥", label: "Active citizens", value: d.activeUsers ?? "—" },
    { emoji: "⭐", label: "Avg. rating",     value: d.avgRating ? `${d.avgRating} / 5` : "—" },
    { emoji: "🏅", label: "Top reporter",    value: d.topReporter ?? "N/A" },
  ];

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  })();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AV";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col lg:ml-64 min-w-0 overflow-y-auto">

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">Analytics</h2>
              <p className="text-xs text-gray-400 mt-0.5">{liveTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* FIX: show loading spinner while refetching */}
            {loading && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                Updating…
              </span>
            )}
            {isOffline && !loading && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                Demo data
              </span>
            )}
            <div
              onClick={() => navigate("/profile")}
              className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {/* DATE */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                disabled={loading}
                className="rounded-xl text-xs px-3 py-2 outline-none cursor-pointer font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {DATE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* LOCATION */}
              <select
                value={locFilter}
                onChange={(e) => setLocFilter(e.target.value)}
                disabled={loading}
                className="rounded-xl text-xs px-3 py-2 outline-none cursor-pointer font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {LOC_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>

              {/* STATUS */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={loading}
                className="rounded-xl text-xs px-3 py-2 outline-none cursor-pointer font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {STATUS_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <p className="text-xs rounded-xl px-4 py-2 font-medium bg-blue-50 border border-blue-100 text-blue-700 shrink-0">
              {d.insightMessage || "Analytics loaded."}
            </p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map(({ label, value, bg, color, icon }) => (
              <div key={label} className="rounded-2xl p-5 flex items-center gap-4 border border-gray-100/50"
                style={{ backgroundColor: bg }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: `${color}18`, color }}>
                  {icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{label}</p>
                  {loading
                    ? <Skeleton className="h-7 w-12 mt-1" />
                    : <p className="text-2xl font-extrabold tracking-tight mt-0.5" style={{ color }}>{value}</p>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Weekly trend */}
            <Card>
              <CardTitle title="Weekly trend" sub="Issues reported per day" />
              {loading ? <Skeleton className="h-48" /> : (
                <>
                  <ResponsiveContainer width="100%" height={190}>
                    <AreaChart data={lineData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <Tooltip content={<LightTooltip />} />
                      <Area type="monotone" dataKey="issues" name="issues"
                        stroke="#3b82f6" strokeWidth={2.5} fill="url(#areaGrad)"
                        dot={false} activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex justify-between mt-2 px-1">
                    {lineData.map((x) => (
                      <span key={x.day} className="text-xs text-gray-400">{x.day}</span>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* Pie */}
            <Card>
              <CardTitle title="Issues by category" sub="Distribution this period" />
              {loading ? <Skeleton className="h-48" /> : (
                pieData.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-semibold text-gray-300">No issues reported yet</p>
                    <p className="text-xs text-gray-200 mt-1">Submit issues to see the breakdown</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
                      <ResponsiveContainer width={140} height={140}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%"
                            innerRadius={48} outerRadius={66} paddingAngle={3}
                            dataKey="value" startAngle={90} endAngle={-270}>
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%,-50%)",
                        textAlign: "center", pointerEvents: "none",
                      }}>
                        <p style={{ fontSize: 20, color: "#1f2937", fontWeight: 800, lineHeight: 1 }}>{pieTotal}</p>
                        <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>issues</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      {pieData.map((item, i) => (
                        <div key={item.name} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-gray-500">{item.name}</span>
                          <span className="ml-auto font-bold text-gray-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </Card>
          </div>

          {/* Department performance */}
          <Card>
            <CardTitle title="Department performance" sub="Resolved vs pending issues" />
            {loading ? <Skeleton className="h-40" /> : (
              deptData.length === 0 ? (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-sm text-gray-300 font-semibold">No department data yet</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={deptData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                      <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<LightTooltip />} />
                      <Bar dataKey="resolved" name="resolved" fill="#10b981" radius={[6,6,0,0]} maxBarSize={36} />
                      <Bar dataKey="pending"  name="pending"  fill="#ef4444" radius={[6,6,0,0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" /> Resolved
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <div className="w-2 h-2 rounded-full bg-red-400" /> Pending
                    </div>
                  </div>
                </>
              )
            )}
          </Card>

          {/* Citizen engagement */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {citizenStats.map(({ emoji, label, value }) => (
              <div key={label} className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 border border-gray-100 shadow-sm">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gray-50 border border-gray-100">
                  {emoji}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
                  {loading
                    ? <Skeleton className="h-5 w-16 mt-1" />
                    : <p className="text-lg font-extrabold text-gray-800">{value}</p>
                  }
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}
