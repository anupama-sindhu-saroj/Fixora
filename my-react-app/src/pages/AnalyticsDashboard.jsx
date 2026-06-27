import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/shared/Sidebar";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Mock data ────────────────────────────────────────────────────────────────
const LINE_DATA = [
  { day: "Mon", issues: 12 },
  { day: "Tue", issues: 19 },
  { day: "Wed", issues: 9 },
  { day: "Thu", issues: 24 },
  { day: "Fri", issues: 17 },
  { day: "Sat", issues: 8 },
  { day: "Sun", issues: 5 },
];
// ─── Refined Color Palette & Ordered Data ─────────────────────────────────────
const PIE_DATA = [
  { name: "Pothole",      value: 38 },
  { name: "Street light", value: 22 },
  { name: "Trash",        value: 18 },
  { name: "Graffiti",     value: 15 },
  { name: "Other",        value: 7  },
];

// Clean, high-contrast dashboard colors
const PIE_COLORS = [
  "#f59e0b", // Pothole - Amber/Construction warning tone
  "#6366f1", // Street Light - Indigo/Electric night sky tone
  "#0d9488", // Trash - Solid Teal/Sanitation tone
  "#ec4899", // Graffiti - Pink/Vibrant street art tone
  "#94a3b8"  // Other - Muted Slate for miscellaneous items
];

const DEPT_DATA = [
  { dept: "Roads",      resolved: 48, pending: 12 },
  { dept: "Lighting",   resolved: 30, pending: 8  },
  { dept: "Sanitation", resolved: 22, pending: 15 },
  { dept: "Parks",      resolved: 18, pending: 4  },
];


// Formatted KPI cards to match the top status row from the dashboard image
const STATUS_CARDS = [
  { label: "TOTAL WORK ORDERS", value: "0", bg: "#f0f5ff", color: "#2563eb", icon: "📋" },
  { label: "PENDING ISSUES",  value: "0", bg: "#fef2f2", color: "#ef4444", icon: "🕒" },
  { label: "IN PROGRESS",     value: "0", bg: "#fffbeb", color: "#d97706", icon: "🔄" },
  { label: "TOTAL RESOLVED",  value: "0", bg: "#f0fdf4", color: "#22c55e", icon: "✅" },
];

const CITIZEN_STATS = [
  { emoji: "👥", label: "Active citizens", value: "452"      },
  { emoji: "⭐", label: "Avg. rating",     value: "4.3 / 5" },
  { emoji: "🏅", label: "Top reporter",    value: "Citizen #908" },
];

const DATE_OPTS   = ["Last 7 days", "Last 30 days", "This year"];
const LOC_OPTS    = ["All locations", "Ward 1", "Ward 2", "Central"];
const STATUS_OPTS = ["All statuses", "Unresolved", "Under review", "Resolved"];

// ─── Custom tooltip ───────────────────────────────────────────────────────────
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
        <p key={p.name} style={{ color: "#2563eb", fontWeight: 700 }}>
          {p.value} issues
        </p>
      ))}
    </div>
  );
}

// ─── Reusable card ────────────────────────────────────────────────────────────
function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl p-5 ${className}`}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)" }}
    >
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

// ─── Horizontal bar ──────────────────────────────────────────────────────────
function HBar({ label, value, max, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2.5 mb-2.5">
      <span className="text-xs text-gray-500 text-right shrink-0" style={{ width: 70 }}>{label}</span>
      <div className="flex-1 h-2.5 rounded-full" style={{ background: "#f3f4f6" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold text-gray-700 text-right shrink-0" style={{ width: 22 }}>{value}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateFilter,   setDateFilter]   = useState("Last 30 days");
  const [locFilter,    setLocFilter]    = useState("All locations");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setLiveTime(
        new Date().toLocaleDateString("en-US", {
          weekday: "long", year: "numeric", month: "long",
          day: "numeric", hour: "2-digit", minute: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const total = PIE_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col lg:ml-64 min-w-0 overflow-y-auto">
    {/* Header */}
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
      <h2 className="text-xl font-bold text-gray-800 tracking-tight">Analytics</h2>
      <p className="text-xs text-gray-400 mt-0.5">{liveTime}</p>
    </div>
  </div>
  
  {/* Right side alignment with only the user profile icon */}
  <div className="flex items-center">
    <div 
      onClick={() => navigate("/profile")}
      className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors"
    >
      AV
    </div>
  </div>
</header>
        {/* Content */}
        <main className="flex-1 p-6 space-y-6">

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {[
                { opts: DATE_OPTS,   val: dateFilter,   set: setDateFilter },
                { opts: LOC_OPTS,    val: locFilter,    set: setLocFilter },
                { opts: STATUS_OPTS, val: statusFilter, set: setStatusFilter },
              ].map(({ opts, val, set }) => (
                <select
                  key={opts[0]}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="rounded-xl text-xs px-3 py-2 outline-none cursor-pointer font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {opts.map((o) => (
                    <option key={o} style={{ background: "#fff", color: "#333" }}>{o}</option>
                  ))}
                </select>
              ))}
            </div>
            <p className="text-xs rounded-xl px-4 py-2 font-medium bg-blue-50 border border-blue-100 text-blue-700 shrink-0">
              💡 This month saw a <strong className="text-blue-800">20% increase</strong> in road-related issues.
            </p>
          </div>

          {/* KPI status cards matching the image styling exactly */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATUS_CARDS.map(({ label, value, bg, color, icon }) => (
              <div 
                key={label} 
                className="rounded-2xl p-5 flex items-center gap-4 border border-gray-100/50"
                style={{ backgroundColor: bg }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${color}15`, color: color }}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{label}</p>
                  <p className="text-2xl font-extrabold tracking-tight mt-0.5" style={{ color: color }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Area chart */}
            <Card>
              <CardTitle title="Weekly trend" sub="Issues reported per day" />
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={LINE_DATA} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <LightTooltip />
                  <Tooltip content={<LightTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="issues"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#areaGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-between mt-2 px-1">
                {LINE_DATA.map((d) => (
                  <span key={d.day} className="text-xs text-gray-400">{d.day}</span>
                ))}
              </div>
            </Card>

            {/* Donut */}
            <Card>
              <CardTitle title="Issues by category" sub="Distribution this period" />
              <div className="flex items-center gap-4">
                <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie
                        data={PIE_DATA}
                        cx="50%" cy="50%"
                        innerRadius={48} outerRadius={66}
                        paddingAngle={3}
                        dataKey="value"
                        startAngle={90} endAngle={-270}
                      >
                        {PIE_DATA.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i]} stroke="transparent" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none",
                  }}>
                    <p style={{ fontSize: 20, fontHex: "#1f2937", fontWeight: 800, lineHeight: 1 }}>{total}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>issues</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  {PIE_DATA.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-gray-500">{d.name}</span>
                      <span className="ml-auto font-bold text-gray-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Department performance */}
          <Card>
            <CardTitle title="Department performance" sub="Resolved vs pending issues" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Resolved</p>
                {DEPT_DATA.map((d) => (
                  <HBar
                    key={d.dept + "r"}
                    label={d.dept}
                    value={d.resolved}
                    max={60}
                    color="#10b981"
                  />
                ))}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Pending</p>
                {DEPT_DATA.map((d) => (
                  <HBar
                    key={d.dept + "p"}
                    label={d.dept}
                    value={d.pending}
                    max={20}
                    color="#ef4444"
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Citizen engagement */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CITIZEN_STATS.map(({ emoji, label, value }) => (
              <div key={label} className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 border border-gray-100 shadow-sm">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gray-50 border border-gray-100">
                  {emoji}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
                  <p className="text-lg font-extrabold text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}