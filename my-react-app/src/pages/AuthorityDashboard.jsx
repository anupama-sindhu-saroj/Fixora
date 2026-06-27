import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/shared/Sidebar";

// ── Status badge helper ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = status?.replace(/\s/g, "") || "Pending";
  const styles = {
    Pending:    { background: "#e74c3c", color: "#fff" },
    InProgress: { background: "#f1c40f", color: "#222" },
    Resolved:   { background: "#2ecc71", color: "#fff" },
  };
  const style = styles[s] || styles.Pending;
  return (
    <span style={{
      ...style,
      padding: "2px 8px",
      borderRadius: 6,
      fontWeight: 600,
      fontSize: "0.85rem",
    }}>
      {status || "Pending"}
    </span>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  const colors = {
    blue:   { bg: "#eef2ff", icon: "#4a3ce0" },
    red:    { bg: "#fef2f2", icon: "#e74c3c" },
    yellow: { bg: "#fffbeb", icon: "#f39c12" },
    green:  { bg: "#f0fdf4", icon: "#27ae60" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      background: "#fff", padding: "18px 20px", borderRadius: 12,
      boxShadow: "0 4px 10px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 42, height: 42, borderRadius: "50%", background: c.bg,
        color: c.icon, fontSize: 18, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <h4 style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>{label}</h4>
        <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>{value}</p>
      </div>
    </div>
  );
}

// ── Live Map (Leaflet) ───────────────────────────────────────────────────────
function LiveMap({ issues }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(null);

  useEffect(() => {
    if (!window.L || mapInstanceRef.current) return;
    const map = window.L.map(mapRef.current).setView([25.4358, 81.8463], 12);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    markersRef.current = window.L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;
    markersRef.current.clearLayers();
    issues.forEach((issue) => {
      let lat = issue?.locationCoords?.lat;
      let lng = issue?.locationCoords?.lng;
      if (!lat || !lng) {
        lat = 25.4358 + Math.random() * 0.02 - 0.01;
        lng = 81.8463 + Math.random() * 0.02 - 0.01;
      }
      const status = (issue.status || "Pending").toLowerCase();
      const color =
        status.includes("resolved") ? "green" :
        status.includes("progress") ? "orange" :
        status.includes("review")   ? "yellow" : "red";

      window.L.circleMarker([lat, lng], {
        radius: 8, color, fillColor: color, fillOpacity: 0.8, weight: 2,
      })
        .addTo(markersRef.current)
        .bindPopup(`<b>${issue.issueType || issue.title}</b><br>${issue.location || "Unknown"}<br><small>Status: <b>${issue.status || "Pending"}</b></small>`);
    });
  }, [issues]);

  return (
    <div ref={mapRef} style={{
      width: "100%", height: 350, borderRadius: 12, marginTop: 10,
      border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }} />
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function AuthorityDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [modal, setModal] = useState(null);
  const [authorityName, setAuthorityName] = useState("Authority");
  const [liveTime, setLiveTime] = useState("");

  // Form state
  const [formTitle, setFormTitle]       = useState("");
  const [formSummary, setFormSummary]   = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDept, setFormDept]         = useState("Roads Department");
  const [formFile, setFormFile]         = useState(null);
  const [toast, setToast]               = useState(null);

  // ── Live clock ────────────────────────────────────────────────────────────
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

  // ── Authority name from localStorage ─────────────────────────────────────
  useEffect(() => {
    const name = localStorage.getItem("authorityName") || "Authority";
    setAuthorityName(name);
  }, []);

  // ── Toast helper ─────────────────────────────────────────────────────────
  function showToast(message, type = "info") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Load issues ───────────────────────────────────────────────────────────
  async function loadIssues() {
    try {
      const token = localStorage.getItem("authorityToken");
      const res = await fetch("http://localhost:5001/api/issues/with-locations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIssues(data);
      calcStats(data);
    } catch {
      const fallback = [
        {
          _id: "1023",
          issueType: "Pothole on Main Street (High Priority)",
          description: "Large pothole disrupting traffic flow near Main and 3rd.",
          location: "Main Street, Ward 2",
          status: "Pending",
          imageUrls: ["https://placehold.co/600x400/008080/ffffff?text=Pothole"],
          locationCoords: { lat: 25.4358, lng: 81.8463 },
        },
        {
          _id: "1024",
          issueType: "Streetlight not working near Central Park",
          description: "Street is very dark at night, unsafe for pedestrians.",
          location: "Central Park Road",
          status: "Under Review",
          imageUrls: ["https://placehold.co/600x400/4a3ce0/ffffff?text=Streetlight"],
          locationCoords: { lat: 25.4558, lng: 81.8563 },
        },
      ];
      setIssues(fallback);
      calcStats(fallback);
    }
  }

  function calcStats(data) {
    setStats({
      total:      data.length,
      pending:    data.filter(i => i.status === "Pending").length,
      inProgress: data.filter(i => i.status === "In Progress").length,
      resolved:   data.filter(i => i.status === "Resolved").length,
    });
  }

  useEffect(() => {
    loadIssues();
    const id = setInterval(loadIssues, 30000);
    return () => clearInterval(id);
  }, []);

  // ── Open modal + mark In Progress ─────────────────────────────────────────
  async function openModal(issueId) {
    try {
      const token = localStorage.getItem("authorityToken");
      const res = await fetch(`http://localhost:5001/api/issues/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const issue = await res.json();
      if (issue.status !== "Resolved") {
        await fetch(`http://localhost:5001/api/issues/${issue._id}/progress`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
      setModal(issue);
      setTimeout(loadIssues, 400);
    } catch {
      const found = issues.find(i => i._id === issueId);
      if (found) setModal(found);
    }
  }

  function goToSolutionForm() {
    if (!modal) return;
    setFormTitle(modal.issueType || modal.title || "");
    setFormLocation(modal.location || "");
    setModal(null);
    document.querySelector(".solution-form-card")?.scrollIntoView({ behavior: "smooth" });
  }

  // ── Submit solution ───────────────────────────────────────────────────────
  async function handleSubmitSolution(e) {
    e.preventDefault();
    if (!formTitle || !formSummary || !formDept) {
      showToast("⚠️ Please fill all fields.", "error");
      return;
    }
    try {
      const token = localStorage.getItem("authorityToken");
      const res = await fetch("http://localhost:5001/api/issues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allIssues = await res.json();
      const found = allIssues.find(i => i.issueType === formTitle || i.title === formTitle);
      if (!found?._id) {
        showToast("❌ Could not match this issue title with any record.", "error");
        return;
      }
      const formData = new FormData();
      formData.append("summary", formSummary);
      formData.append("department", formDept);
      if (formFile) formData.append("image", formFile);

      const updateRes = await fetch(`http://localhost:5001/api/solutions/${found._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await updateRes.json();
      if (updateRes.ok) {
        showToast("✅ Solution submitted successfully!", "success");
        setFormTitle(""); setFormSummary(""); setFormLocation(""); setFormFile(null);
        loadIssues();
      } else {
        showToast(data.error || "Failed to submit solution.", "error");
      }
    } catch {
      showToast("❌ Server error while submitting solution.", "error");
    }
  }

  // ── Filtered issues ───────────────────────────────────────────────────────
  const filtered = issues.filter(i => {
    if (statusFilter === "all") return true;
    const s = (i.status || "").toLowerCase().replace(/\s/g, "-");
    return s === statusFilter;
  });

  const initials = authorityName.charAt(0).toUpperCase();

  // ── Toast colors ──────────────────────────────────────────────────────────
  const toastBg = { success: "#4a3ce0", error: "#e74c3c", info: "#008080" };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        marginLeft: 256, minWidth: 0, overflowY: "auto",
        background: "#f7f9fc",
      }}>

        {/* ── Header ── */}
        <header style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "#fff", padding: "14px 32px",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          position: "sticky", top: 0, zIndex: 20,
        }}>
          {/* Mobile hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{
                display: "none", background: "none", border: "none",
                cursor: "pointer", color: "#64748b", padding: 0,
              }}
              className="mobile-hamburger"
            >
              ☰
            </button>
            <div>
              <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                Authority Dashboard
              </h1>
              <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0 }}>{liveTime}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontWeight: 600, fontSize: "1rem", color: "#1e293b" }}>
              Welcome, {authorityName}
            </span>
            <div
              style={{
                width: 42, height: 42,
                background: "linear-gradient(135deg, #4a3ce0, #3ca1e0)",
                color: "#fff", fontWeight: 700, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.95rem",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* ── Stats Row ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20, margin: "28px 40px",
        }}>
          <StatCard icon="📋" label="Total Work Orders" value={stats.total}      color="blue"   />
          <StatCard icon="⚠️"  label="Pending Issues"    value={stats.pending}    color="red"    />
          <StatCard icon="🔄"  label="In Progress"        value={stats.inProgress} color="yellow" />
          <StatCard icon="✅"  label="Resolved Today"     value={stats.resolved}   color="green"  />
        </div>

        {/* ── Main Grid ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr",
          gap: 25, padding: "0 40px 40px",
        }}>

          {/* ── LEFT COLUMN ── */}
          <div>

            {/* Live Issue Map */}
            <div style={{
              background: "#fff", borderRadius: 12, padding: 20,
              boxShadow: "0 4px 10px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
              marginBottom: 20,
            }}>
              <h3 style={{ color: "#1e293b", fontSize: "1.1rem", marginBottom: 4 }}>Live Issue Map</h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: 0 }}>
                Currently reported problems across the city
              </p>
              <LiveMap issues={issues} />
            </div>

            {/* Open Issues Log */}
            <div style={{
              background: "#fff", borderRadius: 12, padding: 20,
              boxShadow: "0 4px 10px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
            }}>
              <h3 style={{ color: "#1e293b", fontSize: "1.1rem", marginBottom: 10 }}>Open Issues Log</h3>

              {/* Filters */}
              <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: 8,
                    border: "1px solid #cbd5e1", fontSize: "0.9rem",
                    color: "#1e293b", background: "#fff",
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="unassigned">Unassigned</option>
                  <option value="under-review">Under Review</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button style={{
                  background: "#252e32", color: "#fff", border: "none",
                  borderRadius: 8, padding: "10px 16px", fontWeight: 600,
                  fontSize: "0.9rem", cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(74,60,224,0.2)",
                }}>
                  🔍 Search
                </button>
              </div>

              {/* Issue list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.length === 0 && (
                  <p style={{ color: "#64748b", fontSize: "0.9rem" }}>No reported issues found.</p>
                )}
                {filtered.map(issue => (
                  <div key={issue._id} style={{
                    background: "#f8fafc", border: "1px solid #e2e8f0",
                    borderLeft: "4px solid #4a3ce0", padding: "14px 18px",
                    borderRadius: 10, display: "flex",
                    justifyContent: "space-between", alignItems: "center", gap: 10,
                  }}>
                    <div>
                      <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                        {issue.issueType || "Unnamed Issue"}
                      </h4>
                      <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "2px 0" }}>
                        <strong>Description:</strong> {issue.description || "No description provided"}
                      </p>
                      <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "2px 0" }}>
                        <strong>Location:</strong> {issue.location || "N/A"}
                      </p>
                      <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "2px 0" }}>
                        <strong>Status:</strong>{" "}
                        <StatusBadge status={issue.status} />
                      </p>
                    </div>
                    <button
                      onClick={() => openModal(issue._id)}
                      style={{
                        background: "#252e32", color: "#fff", border: "none",
                        borderRadius: 8, padding: "8px 14px", fontWeight: 600,
                        fontSize: "0.9rem", cursor: "pointer", whiteSpace: "nowrap",
                        height: 38, display: "flex", alignItems: "center",
                        boxShadow: "0 2px 6px rgba(74,60,224,0.2)",
                      }}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Submit Solution ── */}
          <div>
            <div
              className="solution-form-card"
              style={{
                background: "#fff", borderRadius: 12, padding: "28px 24px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
              }}
            >
              <h3 style={{ color: "#1e293b", fontSize: "1.1rem", marginBottom: 18 }}>
                Submit Issue Solution
              </h3>
              <form onSubmit={handleSubmitSolution} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e293b" }}>Issue Title</label>
                  <input
                    type="text"
                    placeholder="Enter the issue title"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e293b" }}>Solution Summary</label>
                  <textarea
                    placeholder="Describe how the issue was resolved..."
                    value={formSummary}
                    onChange={e => setFormSummary(e.target.value)}
                    style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e293b" }}>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Ward 2, Elm Street"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e293b" }}>Department Responsible</label>
                  <select
                    value={formDept}
                    onChange={e => setFormDept(e.target.value)}
                    style={inputStyle}
                  >
                    <option>Roads Department</option>
                    <option>Lighting Department</option>
                    <option>Sanitation Department</option>
                    <option>Water Supply</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e293b" }}>Upload Resolved Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFormFile(e.target.files[0])}
                    style={{
                      ...inputStyle,
                      padding: 8, fontSize: "0.9rem",
                      background: "#f8fafc", border: "1px dashed #94a3b8",
                      cursor: "pointer",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%", marginTop: 5, padding: 14,
                    fontSize: "1rem", fontWeight: 600,
                    background: "#252e32", color: "#fff",
                    border: "none", borderRadius: 8, cursor: "pointer",
                    boxShadow: "0 3px 8px rgba(74,60,224,0.25)",
                  }}
                >
                  Submit Solution
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Issue Detail Modal ── */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.6)", display: "flex",
            alignItems: "flex-start", justifyContent: "center",
            paddingTop: 100, overflowY: "auto",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 12, padding: "20px 30px",
              width: "90%", maxWidth: 600, position: "relative",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)", marginBottom: 40,
            }}
          >
            {/* Close */}
            <span
              onClick={() => setModal(null)}
              style={{
                position: "absolute", top: 10, right: 20,
                fontSize: 30, cursor: "pointer", color: "#aaa", lineHeight: 1,
              }}
            >
              &times;
            </span>

            <h2 style={{ color: "#1e293b", marginBottom: 8 }}>
              {modal.issueType || modal.title || "Issue"}
            </h2>
            <p style={{ color: "#64748b", marginBottom: 10 }}>
              {modal.description || "No description provided"}
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong>Location:</strong> {modal.location || "Unknown"}
            </p>
            <img
              src={
                Array.isArray(modal.imageUrls) && modal.imageUrls.length > 0
                  ? (modal.imageUrls[0].startsWith("http") ? modal.imageUrls[0] : `http://localhost:5001/${modal.imageUrls[0]}`)
                  : (modal.image || modal.imageUrl || "https://placehold.co/600x400?text=No+Image")
              }
              alt="Reported issue"
              style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 8, marginTop: 10 }}
            />

            <hr style={{ margin: "16px 0", borderColor: "#e2e8f0" }} />
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: 12 }}>
              To resolve this issue, click below:
            </p>
            <button
              onClick={goToSolutionForm}
              style={{
                width: "100%", padding: 12, fontWeight: 600, fontSize: "0.95rem",
                background: "#252e32", color: "#fff", border: "none",
                borderRadius: 8, cursor: "pointer",
                boxShadow: "0 2px 6px rgba(74,60,224,0.2)",
              }}
            >
              Go to Submit Solution
            </button>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 25, right: 25, zIndex: 9999,
          background: toastBg[toast.type] || toastBg.info,
          color: "#fff", padding: "12px 18px", borderRadius: 8,
          fontWeight: 600, fontSize: "0.9rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          animation: "fadeIn 0.3s ease",
        }}>
          {toast.message}
        </div>
      )}

      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    </div>
  );
}

// ── Shared input style ────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 8,
  border: "1px solid #cbd5e1", fontSize: "0.95rem",
  color: "#1e293b", background: "#fff",
  outline: "none", boxSizing: "border-box",
};