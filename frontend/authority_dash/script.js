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
const token = localStorage.getItem("authorityToken");

if (token) {
  fetch("http://localhost:5001/api/authority/me", {
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
    const token = localStorage.getItem("authorityToken");

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

function renderIssues(issues) {
  const list = document.querySelector(".issue-list");
  if (!list) return;
  list.innerHTML = "";

  if (!Array.isArray(issues) || issues.length === 0) {
    list.innerHTML = `<p class="muted">No reported issues found.</p>`;
    return;
  }

  issues.forEach(issue => {
    const card = document.createElement("div");
    card.className = "issue-card";

    card.innerHTML = `
      <div>
        <h4>${issue.issueType || "Unnamed Issue"}</h4>
        <p><strong>Description:</strong> ${issue.description || "No description provided"}</p>
        <p><strong>Location:</strong> ${issue.location || "N/A"}</p>
        <p><strong>Status:</strong> <span class="status-${issue.status?.replace(/\s/g, '') || "Pending"}">${issue.status || "Pending"}</span></p>
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


async function loadLiveFeed() {
  renderFeed([
    { tag: "Signals", color: "red", title: "Traffic light malfunction at Grand & 3rd", time: "2m ago" },
    { tag: "Waste", color: "blue", title: "Overflowing garbage bin near Maple Rd", time: "5m ago" },
    { tag: "Vandalism", color: "violet", title: "Graffiti on 12th Street wall", time: "9m ago" },
  ]);
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

// === Update dashboard stats dynamically ===
async function loadDashboardStats() {
  try {
   const token = localStorage.getItem("authorityToken");
    const res = await fetch("http://localhost:5001/api/issues", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const issues = await res.json();

    if (!Array.isArray(issues)) return;

    // Calculate counts
    const total = issues.length;
    const pending = issues.filter(i => i.status === "Pending").length;
    const inProgress = issues.filter(i => i.status === "In Progress").length;
    const resolved = issues.filter(i => i.status === "Resolved").length;

    // ✅ Update numbers in the header
    document.querySelector(".stat-card:nth-child(1) p").textContent = total;
    document.querySelector(".stat-card:nth-child(2) p").textContent = pending;
    document.querySelector(".stat-card:nth-child(3) p").textContent = inProgress;
    document.querySelector(".stat-card:nth-child(4) p").textContent = resolved;

  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

// === Initialize Everything ===
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  loadIssues();
  loadLiveFeed();
  loadDashboardStats();
});

// === Load logged-in Authority info ===
document.addEventListener("DOMContentLoaded", () => {
  const authorityName = localStorage.getItem("authorityName") || "Authority";
  
  // Set the name beside icon
  const nameEl = document.getElementById("authority-name");
  if (nameEl) nameEl.textContent = `Welcome, ${authorityName}`;
  
  // Set initials in the icon
  const initials = authorityName.charAt(0).toUpperCase();
  const iconEl = document.getElementById("profile-icon");
  if (iconEl) iconEl.textContent = initials;
});

// === Handle Solution Form Submission ===
const solutionForm = document.querySelector(".solution-form form");

if (solutionForm) {
  solutionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titleInput = solutionForm.querySelector('input[type="text"]').value.trim();
    const summary = solutionForm.querySelector("textarea").value.trim();
    const department = solutionForm.querySelector("select").value;
    const token = localStorage.getItem("authorityToken");
    if (!titleInput || !summary || !department) {
      showToast("⚠️ Please fill all fields.", "error");
      return;
    }

    try {
      // Fetch issues to find the one by title
      const res = await fetch("http://localhost:5001/api/issues", {
  headers: { Authorization: `Bearer ${localStorage.getItem("authorityToken")}` },
});
      const issues = await res.json();
      const found = issues.find((i) => i.issueType === titleInput || i.title === titleInput);

      if (!found || !found._id) {
        showToast("❌ Could not match this issue title with any record.", "error");
        return;
      }

      const formData = new FormData();
      formData.append("summary", summary); // ✅ changed from “text” to “summary”
      formData.append("department", department);
      const file = solutionForm.querySelector('input[type="file"]').files[0];
      if (file) formData.append("image", file);


      const updateRes = await fetch(`http://localhost:5001/api/solutions/${found._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await updateRes.json();
      if (updateRes.ok) {
        showToast("✅ Solution submitted successfully!", "success");
        solutionForm.reset();
        loadIssues(); // Refresh issue list after update
      } else {
        showToast(data.error || "Failed to submit solution.", "error");
      }
    } catch (err) {
      console.error("Error:", err);
      showToast("❌ Server error while submitting solution.", "error");
    }
  });
}
// === ISSUE DETAIL POPUP MODAL LOGIC ===
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("issueModal");
  const closeModal = document.getElementById("closeModal");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-description");
  const modalLocation = document.getElementById("modal-location");
  const modalImage = document.getElementById("modal-image");

  // Attach click listener to dynamically created "View Details" buttons
  document.body.addEventListener("click", async (e) => {
    if (e.target.classList.contains("view-btn")) {
      const issueId = e.target.dataset.id;
      await openModal(issueId);
    }
  });

  let selectedIssue = null;

async function openModal(issueId) {
  try {
    const token = localStorage.getItem("authorityToken");
    const res = await fetch(`http://localhost:5001/api/issues/${issueId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const issue = await res.json();

    // ✅ Mark as 'In Progress' if not resolved
    if (issue.status !== "Resolved") {
      try {
        await fetch(`http://localhost:5001/api/issues/${issue._id}/progress`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn("⚠️ Could not mark issue as In Progress:", err);
      }
    }

    // Update modal info
    modalTitle.textContent = issue.issueType || issue.title || "Issue";
    modalDesc.textContent = issue.description || "No description provided";
    modalLocation.textContent = issue.location || "Unknown";

    selectedIssue = issue;

    const hiddenInput = document.getElementById("selectedIssueId");
    if (hiddenInput) hiddenInput.value = issue._id;

    if (Array.isArray(issue.imageUrls) && issue.imageUrls.length > 0) {
      const firstImg = issue.imageUrls[0];
      modalImage.src = firstImg.startsWith("http")
        ? firstImg
        : `http://localhost:5001/${firstImg}`;
    } else {
      modalImage.src =
        issue.image || issue.imageUrl || "https://placehold.co/600x400?text=No+Image";
    }

    modal.style.display = "block";

    // ✅ Refresh issue list after a short delay (so UI updates)
    setTimeout(loadIssues, 400);
  } catch (err) {
    console.error("Error loading issue details:", err);
  }
}



const goToSolutionBtn = document.getElementById("goToSolutionBtn");
if (goToSolutionBtn) {
  goToSolutionBtn.addEventListener("click", () => {
    if (!selectedIssue) return;

    // ✅ Fill sidebar form automatically
    const titleInput = document.querySelector('.solution-form input[type="text"]');
    const locationInput = document.querySelector('.solution-form input[placeholder*="Ward"]');

    if (titleInput) titleInput.value = selectedIssue.issueType || selectedIssue.title || "";
    if (locationInput) locationInput.value = selectedIssue.location || "";

    const hiddenInput = document.getElementById("selectedIssueId");
    if (hiddenInput) hiddenInput.value = selectedIssue._id;

    // ✅ Close the popup
    document.getElementById("issueModal").style.display = "none";

    // ✅ Smooth scroll to the sidebar form
    document.querySelector(".solution-form").scrollIntoView({ behavior: "smooth" });
  });
}



  // Close modal when clicking X or outside
  closeModal.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Handle solution submission from modal
  const solutionForm = document.getElementById("solutionForm");
  if (solutionForm) {
    solutionForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const issueId = modalTitle.dataset.id;
      const solutionText = document.getElementById("solutionText").value;
      const solutionImage = document.getElementById("solutionImage").files[0];

      const formData = new FormData();
      formData.append("text", solutionText);
      if (solutionImage) formData.append("image", solutionImage);

      try {
        const res = await fetch(`http://localhost:5001/api/solutions/${issueId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          showToast("✅ Solution submitted successfully!", "success");
          modal.style.display = "none";
          loadIssues(); // reload after solution submitted
        } else {
          showToast("❌ Failed to submit solution.", "error");
        }
      } catch (err) {
        console.error("Error submitting solution:", err);
        showToast("⚠️ Error submitting solution.", "error");
      }
    });
  }
});
