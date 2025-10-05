// === Load Fixora Logo from backend ===
fetch("http://localhost:5001/api/files?type=logo")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("logo-container");
    if (!container) return;
    if (Array.isArray(data) && data.length > 0) {
      const logoUrl = data[0].url || data[0].secure_url || data[0].imageUrl;
      if (!logoUrl) return;

      const img = document.createElement("img");
      img.src = logoUrl.startsWith("http") ? logoUrl : `http://localhost:5001${logoUrl}`;
      img.alt = "Fixora Logo";
      img.style.height = "34px";
      img.style.objectFit = "contain";

      container.innerHTML = "";
      container.appendChild(img);
    }
  })
  .catch(() => console.warn("⚠️ Could not load logo from backend."));

// === Fetch logged-in authority user ===
const token = localStorage.getItem("authToken");
if (token) {
  fetch("http://localhost:5001/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(user => {
      if (user && user.name) {
        const header = document.querySelector(".header h1");
        if (header) header.textContent = `Welcome, ${user.name}`;
      }
    })
    .catch(() => console.warn("⚠️ Unable to fetch user details."));
}

// === Sidebar active state ===
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-links a").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
  });
});

// === Load Issues from Backend ===
async function loadIssues() {
  try {
    const res = await fetch("http://localhost:5001/api/issues", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const issues = await res.json();
    renderIssues(issues);
    renderMapIssues(issues); // 👈 Add to map too
  } catch (err) {
    console.warn("⚠️ Failed to load issues. Using fallback data.");
    const fallback = [
      {
        _id: "1023",
        title: "Pothole on Main Street (High Priority)",
        reporter: "Citizen #456",
        desc: "Large pothole disrupting traffic flow near Main and 3rd.",
        location: "Main Street, Ward 2",
        status: "Unassigned",
        image: "https://placehold.co/600x400/008080/ffffff?text=Pothole",
        locationCoords: { lat: 25.4358, lng: 81.8463 },
      },
      {
        _id: "1024",
        title: "Streetlight not working near Central Park",
        reporter: "Citizen #789",
        desc: "Street is very dark at night, unsafe for pedestrians.",
        location: "Central Park Road",
        status: "Under Review",
        image: "https://placehold.co/600x400/4a3ce0/ffffff?text=Streetlight",
        locationCoords: { lat: 25.4558, lng: 81.8563 },
      },
    ];
    renderIssues(fallback);
    renderMapIssues(fallback);
  }
}

// === Render Issues List ===
function renderIssues(issues) {
  const list = document.querySelector(".issue-list");
  if (!list) return;
  list.innerHTML = "";

  issues.forEach(issue => {
    const card = document.createElement("div");
    card.className = "issue-card";
    card.innerHTML = `
      <div>
        <h4>${issue.title}</h4>
        <p>Reported by: ${issue.reporter}</p>
      </div>
      <button class="view-btn" data-id="${issue._id}">View Details</button>
    `;
    list.appendChild(card);
  });
}

// === Toast System ===
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => (toast.style.opacity = "1"), 50);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

const style = document.createElement("style");
style.textContent = `
.toast {
  position: fixed;
  bottom: 25px;
  right: 25px;
  padding: 12px 18px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 9999;
}
.toast.success { background: #4a3ce0; }
.toast.error { background: #e74c3c; }
.toast.info { background: #008080; }
`;
document.head.appendChild(style);

// === Dynamic Live Feed ===
async function loadLiveFeed() {
  try {
    const res = await fetch("http://localhost:5001/api/livefeed");
    const data = await res.json();
    renderFeed(data);
  } catch {
    renderFeed([
      { tag: "Signals", color: "red", title: "Traffic light malfunction at Grand & 3rd", time: "2m ago" },
      { tag: "Waste", color: "blue", title: "Overflowing garbage bin near Maple Rd", time: "5m ago" },
      { tag: "Vandalism", color: "violet", title: "Graffiti on 12th Street wall", time: "9m ago" },
    ]);
  }
}

function renderFeed(feed) {
  const container = document.querySelector(".live-feed");
  if (!container) return;
  container.innerHTML = `<h3>Live Feed</h3><p class="muted">Latest citizen submissions</p>`;
  feed.forEach(item => {
    const div = document.createElement("div");
    div.className = "feed-card";
    div.innerHTML = `
      <span class="feed-tag ${item.color}">${item.tag}</span>
      <h4>${item.title}</h4>
      <p class="time">${item.time}</p>
      <button class="feed-btn">View Details</button>
    `;
    container.appendChild(div);
  });
}

// === Live Map Integration (Leaflet) ===
let map;
function initMap() {
  const mapContainer = document.getElementById("liveMap");
  if (!mapContainer) return;

  map = L.map("liveMap").setView([25.4358, 81.8463], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
}

function renderMapIssues(issues) {
  if (!map) return;
  issues.forEach(issue => {
    if (issue.locationCoords && issue.locationCoords.lat && issue.locationCoords.lng) {
      const marker = L.marker([issue.locationCoords.lat, issue.locationCoords.lng]).addTo(map);
      marker.bindPopup(`
        <b>${issue.title}</b><br>
        ${issue.location}<br>
        <small>Status: ${issue.status || "Pending"}</small>
      `);
    }
  });
}

// === Initialize Everything ===
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  loadIssues();
  loadLiveFeed();
});
