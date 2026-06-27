import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [allIssues, setAllIssues] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState(false);
  const [modal, setModal] = useState(null);

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
    <div className="chronicle-page">
      <div className="chronicle-inner">
        {/* Header */}
        <h1 className="chronicle-title">
          <span className="neon-text">Fixora Chronicle:</span> Resolved Issues
        </h1>
        <h3 className="chronicle-subtitle">The city's living library of fixes.</h3>

        {/* Filters */}
        <div className="chronicle-filters">
          <div className="chronicle-search-wrap">
            <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search title, description, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="chronicle-search"
            />
          </div>

          <select value={category} onChange={(e) => setCategory(e.target.value)} className="chronicle-select">
            <option value="">All Categories</option>
            <option value="Road">Road</option>
            <option value="Waste">Waste</option>
            <option value="Lighting">Lighting</option>
            <option value="Water">Water</option>
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)} className="chronicle-select">
            <option value="">All Years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>

        {/* Count */}
        <div className="chronicle-count">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="count-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="neon-text">{filtered.length}</span>&nbsp;Issues Resolved
        </div>

        {/* Timeline */}
        <div className="chronicle-timeline">
          <div className="timeline-line hidden-mobile" />
          <div className="archive-container">
            {error && (
              <p className="chronicle-error">Failed to load Chronicles. Please try again later.</p>
            )}
            {!error && filtered.length === 0 && (
              <p className="chronicle-empty">No resolved issues found.</p>
            )}
            {filtered.map((issue) => (
              <div key={issue.id} className="chronicle-card">
                <div className="card-grid">
                  {/* Left info */}
                  <div className="card-info">
                    <span className="card-meta">{issue.category} | ID: FIX-{issue.id}</span>
                    <h2 className="card-title">{issue.title}</h2>
                    <p className="card-summary">{issue.summary}</p>
                    <div className="card-details">
                      <p>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="detail-icon">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Resolved in: <strong>{issue.resolutionTime}</strong>
                      </p>
                      <p>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="detail-icon">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Resolved Date: <strong>{issue.resolved_at}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Right images */}
                  <div className="card-images">
                    <div className="image-pair">
                      <img src={issue.imageBefore} alt="Before" className="issue-img" />
                      <img src={issue.imageAfter} alt="After" className="issue-img" />
                    </div>
                    <button className="view-details-btn" onClick={() => setModal(issue)}>
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="load-more-wrap">
          <button className="load-more-btn">Load More Issues</button>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal.title}</h2>
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