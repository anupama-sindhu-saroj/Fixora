<<<<<<< HEAD
// === Load latest logo ===
fetch("http://localhost:5001/api/files?type=logo")
  .then(res => res.json())
  .then(data => {
    if (data.length > 0) {
      const logoUrl = data[0].url;
      const img = document.createElement("img");
      img.src = logoUrl;
      img.alt = "Fixora Logo";
      img.width = 150;

      const container = document.getElementById("logo-container");
      if (container) {
        container.innerHTML = "";
        container.appendChild(img);
      }
    } else {
      console.warn("⚠️ No logo found in DB. Please upload with type=logo.");
    }
  })
  .catch(err => console.error("Logo fetch error:", err));


// === Fetch logged-in authority details ===
const token = localStorage.getItem("authToken"); 
if (token) {
  fetch("http://localhost:5001/api/auth/me", {
    headers: { "Authorization": `Bearer ${token}` }
=======
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
>>>>>>> 5458181e8fcf8a0eb83dc9c40187d6181a2daf10
  })
    .then(res => res.json())
    .then(user => {
      if (user && user.name) {
<<<<<<< HEAD
        const userNameEl = document.querySelector(".user-info span");
        const welcomeEl = document.querySelector(".dashboard-header h2");
        if (userNameEl) userNameEl.textContent = user.name;
        if (welcomeEl) welcomeEl.textContent = `Welcome, ${user.department || "Authority"}!`;
      }
    })
    .catch(err => console.error("❌ Error fetching authority details:", err));
} else {
  console.warn("⚠️ No token found. Redirecting to login...");
  // window.location.href = "../login-choice.html";
}


// === Fake issues (later fetch from DB) ===
const issues = {
  "1023": {
    title: "Pothole on Main Street (High Priority)",
    desc: "Large pothole disrupting traffic flow.",
    reporter: "Citizen #456",
    location: "Main Street",
    image: "https://placehold.co/600x400/008080/ffffff?text=Pothole",
    status: "UP"
  },
  "1024": {
    title: "Streetlight not working near Central Park",
    desc: "Street is very dark at night, unsafe for pedestrians.",
    reporter: "Citizen #789",
    location: "Central Park",
    image: "https://placehold.co/600x400/4a3ce0/ffffff?text=Streetlight",
    status: "Review"
  },
  "1025": {
    title: "Overflowing garbage bin at Market Square",
    desc: "Trash piling up, creating smell and hygiene issues.",
    reporter: "Citizen #321",
    location: "Market Square",
    image: "https://placehold.co/600x400/59ac77/ffffff?text=Garbage",
    status: "Resolved"
  }
};


// === Issue Modal ===
const modal = document.getElementById("issue-modal");
const closeBtn = document.querySelector(".close-btn");
const resolveBtn = document.getElementById("resolve-btn");
let currentIssue = null;

// View Details → show modal
document.querySelectorAll(".issue-card .view-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const id = e.target.closest(".issue-card").querySelector(".issue-id").innerText.replace("#", "");
    const issue = issues[id];
    if (!issue) return;

    currentIssue = issue;

    // Fill modal
    document.getElementById("modal-title").innerText = issue.title;
    document.getElementById("modal-desc").innerText = issue.desc;
    document.getElementById("modal-reporter").innerText = issue.reporter;
    document.getElementById("modal-location").innerText = issue.location;
    document.getElementById("modal-image").src = issue.image;

    // Progress bar
    const bar = document.getElementById("modal-progress");
    if (issue.status === "UP") bar.style.width = "33%";
    else if (issue.status === "Review") bar.style.width = "66%";
    else if (issue.status === "Resolved") bar.style.width = "100%";

    modal.style.display = "block";
  });
});

// Close modal
if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

// Resolve button → open Submit Solution form
if (resolveBtn) {
  resolveBtn.addEventListener("click", () => {
    if (!currentIssue) return;

    modal.style.display = "none";

    // Prefill form
    document.getElementById("issue-title").value = currentIssue.title;
    document.getElementById("issue-location").value = currentIssue.location;

    // Switch sections
    document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
    document.getElementById("submit-issue-solution").classList.add("active");

    // Update sidebar
    document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active"));
    document.querySelector('a[href="#submit-issue-solution"]').classList.add("active");
  });
}


// === Sidebar navigation switching ===
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".content-section");

navItems.forEach(item => {
  item.addEventListener("click", e => {
    const target = item.getAttribute("href");

    if (target.startsWith("#")) {
      e.preventDefault();
      navItems.forEach(nav => nav.classList.remove("active"));
      sections.forEach(sec => sec.classList.remove("active"));

      item.classList.add("active");
      document.querySelector(target).classList.add("active");
    } else {
      window.location.href = target; // external page
    }
  });
});


// === Submit Issue Solution Handler ===
document.getElementById("solution-form")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("issue-title").value;
  const solution = document.getElementById("solution-summary").value;
  const location = document.getElementById("issue-location").value;
  const department = document.getElementById("department").value;

  alert(`✅ Solution Submitted!\nTitle: ${title}\nLocation: ${location}\nDepartment: ${department}\nSolution: ${solution}`);

  // TODO: send to backend with fetch("/api/solutions", { method: "POST", body: FormData })
});


// === Image Preview (for resolved image) ===
const resolvedImageInput = document.getElementById("resolved-image");
const preview = document.getElementById("image-preview");

if (resolvedImageInput && preview) {
  resolvedImageInput.addEventListener("change", () => {
    const file = resolvedImageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => { preview.innerHTML = `<img src="${e.target.result}" alt="Resolved Image">`; };
      reader.readAsDataURL(file);
    }
  });

  preview.addEventListener("dragover", e => { e.preventDefault(); preview.classList.add("dragover"); });
  preview.addEventListener("dragleave", () => preview.classList.remove("dragover"));
  preview.addEventListener("drop", e => {
    e.preventDefault();
    preview.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) {
      resolvedImageInput.files = e.dataTransfer.files;
      const reader = new FileReader();
      reader.onload = ev => { preview.innerHTML = `<img src="${ev.target.result}" alt="Resolved Image">`; };
      reader.readAsDataURL(file);
    }
  });
}
=======
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
>>>>>>> 5458181e8fcf8a0eb83dc9c40187d6181a2daf10
