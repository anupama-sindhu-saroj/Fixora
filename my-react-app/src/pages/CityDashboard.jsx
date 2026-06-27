import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import Sidebar from "../components/shared/Sidebar";
import StatsGrid from "../components/city-dashboard/StatsGrid";
import IssueMap from "../components/city-dashboard/IssueMap";
import RecentActivity from "../components/city-dashboard/RecentActivity";
import LiveFeed from "../components/city-dashboard/LiveFeed";

function IssueModal({ data, onClose }) {
  if (!data) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{data.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-2xl leading-none">&times;</button>
        </div>
        <div className="mt-4 text-sm space-y-4">
          <img src={data.image} alt="Issue" className="rounded-xl w-full h-48 object-cover border border-slate-100" />
          <div className="grid grid-cols-3 gap-3">
            {[["Category", data.category], ["Date", data.date], ["Status", data.status]].map(([label, value]) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-slate-700 font-medium mt-1">{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Reported By</p>
            <p className="text-slate-700 font-medium mt-1">{data.reporter}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Description</p>
            <p className="text-slate-700 mt-1 leading-relaxed">{data.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CityDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveTime, setLiveTime] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [liveFeed, setLiveFeed] = useState([]);
  const [modalData, setModalData] = useState(null);

  const isRecent = (issue) => Date.now() - new Date(issue.createdAt).getTime() < 5 * 60 * 1000;

  useEffect(() => {
    const tick = () => setLiveTime(new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/issues/summary");
      const data = await res.json();
      setStats({ total: data.total ?? 0, pending: data.pending ?? 0, inProgress: data.inProgress ?? 0, resolved: data.resolved ?? 0 });
    } catch (err) {
      console.error("Stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const id = setInterval(loadStats, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/issues");
        const issues = await res.json();
        const sorted = [...issues].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentActivity(sorted.slice(0, 10));
        setLiveFeed(sorted.filter(isRecent).slice(0, 10));
      } catch (err) { console.error(err); }
    };
    load();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5001");
    socket.on("newIssue", (issue) => {
      setRecentActivity((prev) => [issue, ...prev].slice(0, 10));
      if (isRecent(issue)) setLiveFeed((prev) => [issue, ...prev].slice(0, 10));
      loadStats();
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">

        {/* Header */}
        <header className="flex items-center justify-between h-20 px-8 bg-white border-b border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-500 hover:text-slate-800" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">City Dashboard</h2>
              <p className="text-xs text-slate-400">{liveTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/report-issue")}
              className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-all duration-200 hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #008080, #473bd0)" }}
            >
              + Report Issue
            </button>
            <img
              src="https://placehold.co/100x100/E2E8F0/4A5568?text=AV"
              alt="User"
              className="h-10 w-10 rounded-full object-cover cursor-pointer ring-2 ring-slate-200 hover:ring-indigo-400 transition-all"
              onClick={() => navigate("/profile")}
            />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-6 grid grid-cols-3 gap-6 overflow-y-auto">
          <div className="col-span-3 lg:col-span-2 space-y-6">
            <StatsGrid stats={stats} loading={statsLoading} />
            <IssueMap />
            <RecentActivity issues={recentActivity} onViewDetails={setModalData} />
          </div>
          <div className="col-span-3 lg:col-span-1">
            <LiveFeed issues={liveFeed} onViewDetails={setModalData} />
          </div>
        </main>
      </div>

      {modalData && <IssueModal data={modalData} onClose={() => setModalData(null)} />}
    </div>
  );
}
