import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/shared/Sidebar";
import "./Chronicle.css";

function getQuarter(date) {
  const month = date.getMonth() + 1;
  if (month <= 3) return "Q1 " + date.getFullYear();
  if (month <= 6) return "Q2 " + date.getFullYear();
  if (month <= 9) return "Q3 " + date.getFullYear();
  return "Q4 " + date.getFullYear();
}

function calculateResolutionTime(start, end) {
  const diffMs = new Date(end) - new Date(start);
  const diffHrs = diffMs / (1000 * 60 * 60);
  if (diffHrs < 24) return `${Math.round(diffHrs)} hours`;
  return `${Math.round(diffHrs / 24)} days`;
}

export default function Chronicle() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allIssues, setAllIssues] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState(false);
  const [modal, setModal] = useState(null);
  const [liveTime, setLiveTime] = useState("");

  const isAuthority = !!localStorage.getItem("authorityToken");

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

  useEffect(() => {
    fetch("http://localhost:5001/api/solutions/chronicles")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const issues = data.map((item, index) => ({
          id: index + 1,
          title: item.issueId?.issueType || "Resolved Issue",
          category: item.issueId?.category || "General",
          year: new Date(item.issueId?.createdAt).getFullYear().toString(),
          quarter: getQuarter(new Date(item.issueId?.createdAt)),
          resolved_at: new Date(item.resolvedAt).toISOString().split("T")[0],
          resolutionTime: calculateResolutionTime(item.issueId?.createdAt, item.resolvedAt),
          authority: item.resolvedBy?.department || "Unknown Department",
          summary: item.summary || "No summary provided.",
          imageBefore: item.issueId?.imageUrls?.[0] || "https://placehold.co/600x400/008080/ffffff?text=BEFORE",
          imageAfter: item.imageUrl || "https://placehold.co/600x400/473bd0/ffffff?text=AFTER",
        }));
        const sorted = [...issues].sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at));
        setAllIssues(sorted);
        setFiltered(sorted);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    const result = allIssues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.summary.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category ? issue.category === category : true;
      const matchesYear = year ? issue.year === year : true;
      return matchesSearch && matchesCategory && matchesYear;
    });
    setFiltered(result);
  }, [search, category, year, allIssues]);

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
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">Chronicle Archive</h2>
              <p className="text-xs text-gray-400 mt-0.5">{liveTime}</p>
            </div>
          </div>

          {/* Profile avatar — clickable only for citizens */}
          <div className="flex items-center">
            <div
              onClick={() => !isAuthority && navigate("/profile")}
              className={`h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm border border-gray-200 ${
                !isAuthority ? "cursor-pointer hover:border-gray-300" : ""
              } transition-colors`}
            >
              AV
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 space-y-6">

          {/* Title */}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              <span className="text-blue-600">Fixora Chronicle:</span> Resolved Issues
            </h1>
            <p className="text-sm text-gray-400 mt-1">The city's living library of fixes.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search title, description, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
              />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl text-xs px-3 py-2 outline-none cursor-pointer font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
              <option value="">All Categories</option>
              <option value="Road">Road</option>
              <option value="Waste">Waste</option>
              <option value="Lighting">Lighting</option>
              <option value="Water">Water</option>
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-xl text-xs px-3 py-2 outline-none cursor-pointer font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
              <option value="">All Years</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Count badge */}
          <div className="flex items-center gap-2">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-600 font-extrabold text-lg">{filtered.length}</span>
            <span className="text-sm font-semibold text-gray-600">Issues Resolved</span>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {error && (
              <p className="text-center text-red-400 text-sm py-10">Failed to load Chronicles. Please try again later.</p>
            )}
            {!error && filtered.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-10">No resolved issues found.</p>
            )}
            {filtered.map((issue) => (
              <div key={issue.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-500">{issue.category} | ID: FIX-{issue.id}</span>
                    <h2 className="text-lg font-bold text-gray-800">{issue.title}</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">{issue.summary}</p>
                    <div className="flex flex-col gap-1 mt-2">
                      <p className="flex items-center gap-2 text-xs text-gray-500">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Resolved in: <strong className="text-gray-700">{issue.resolutionTime}</strong>
                      </p>
                      <p className="flex items-center gap-2 text-xs text-gray-500">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Resolved Date: <strong className="text-gray-700">{issue.resolved_at}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <img src={issue.imageBefore} alt="Before" className="w-full h-32 object-cover rounded-xl border border-gray-100" />
                      <img src={issue.imageAfter} alt="After" className="w-full h-32 object-cover rounded-xl border border-gray-100" />
                    </div>
                    <button
                      className="w-full py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      onClick={() => setModal(issue)}
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center pb-4">
            <button className="px-8 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-sm">
              Load More Issues
            </button>
          </div>

        </main>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ color: "#1f2937" }}>{modal.title}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div>
                <h3 className="modal-section-title">Resolution Summary</h3>
                <p className="modal-summary">{modal.summary}</p>
                <div className="modal-meta">
                  <p>⏱ Resolved in: <strong>{modal.resolutionTime}</strong></p>
                  <p>🏛 Authority: <strong>{modal.authority}</strong></p>
                  <p>📅 Resolved Date: <strong>{modal.resolved_at}</strong></p>
                </div>
              </div>
              <div>
                <h3 className="modal-section-title">Before &amp; After Proof</h3>
                <div className="modal-images">
                  <div>
                    <img src={modal.imageBefore} alt="Before" className="modal-img before-img" />
                    <p className="img-label before-label">BEFORE</p>
                  </div>
                  <div>
                    <img src={modal.imageAfter} alt="After" className="modal-img after-img" />
                    <p className="img-label after-label">AFTER</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-close-btn" onClick={() => setModal(null)}>Close Case Study</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}