// ==========================
// 🌆 FIXORA AUTHORITY DASHBOARD JS
// ==========================

// === Load Fixora Logo from backend ===
fetch("http://localhost:5001/api/files?type=logo")
  .then(res => res.json())
  .then(data => {
    const container = document.querySelector(".logo");
    if (data.length > 0 && container) {
      const img = document.createElement("img");
      img.src = data[0].url;
      img.alt = "Fixora Logo";
      img.width = 130;
      container.innerHTML = "";
      container.appendChild(img);
    }
  })
  .catch(() => console.warn("⚠️ Could not load logo from backend. Using placeholder logo."));


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


// === Sidebar navigation active state ===
const navLinks = document.querySelectorAll(".nav-links a");
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.forEach(l => l.classList.remove("active"));
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
  } catch (err) {
    console.warn("⚠️ Failed to load issues. Using fallback data.");
    renderIssues([
      {
        _id: "1023",
        title: "Pothole on Main Street (High Priority)",
        reporter: "Citizen #456",
        desc: "Large pothole disrupting traffic flow near Main and 3rd.",
        location: "Main Street, Ward 2",
        status: "Unassigned",
        image: "https://placehold.co/600x400/008080/ffffff?text=Pothole",
      },
      {
        _id: "1024",
        title: "Streetlight not working near Central Park",
        reporter: "Citizen #789",
        desc: "Street is very dark at night, unsafe for pedestrians.",
        location: "Central Park Road",
        status: "Under Review",
        image: "https://placehold.co/600x400/4a3ce0/ffffff?text=Streetlight",
      },
    ]);
  }
}


// === Render Issues ===
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

  // reattach click events for all “View Details” buttons
  document.querySelectorAll(".view-btn").forEach(btn =>
    btn.addEventListener("click", e => openIssueModal(e.target.dataset.id, issues))
  );
}


// === Issue Modal Creation ===
const modal = document.createElement("div");
modal.classList.add("modal");
modal.innerHTML = `
  <div class="modal-content">
    <span class="close-btn">&times;</span>
    <h2 id="modal-title"></h2>
    <p id="modal-desc"></p>
    <p><strong>Reported by:</strong> <span id="modal-reporter"></span></p>
    <p><strong>Location:</strong> <span id="modal-location"></span></p>
    <img id="modal-image" src="" alt="Issue" />
    <button id="resolve-btn" class="submit-btn">🛠 Resolve This Issue</button>
  </div>
`;
document.body.appendChild(modal);

const closeBtn = modal.querySelector(".close-btn");
closeBtn.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

let currentIssue = null;

// === Open Issue Modal ===
function openIssueModal(id, issues) {
  currentIssue = issues.find(i => i._id === id);
  if (!currentIssue) return;

  modal.querySelector("#modal-title").innerText = currentIssue.title;
  modal.querySelector("#modal-desc").innerText = currentIssue.desc;
  modal.querySelector("#modal-reporter").innerText = currentIssue.reporter;
  modal.querySelector("#modal-location").innerText = currentIssue.location;
  modal.querySelector("#modal-image").src = currentIssue.image;
  modal.style.display = "block";
}


// === Move to “Submit Solution” when Resolve Clicked ===
modal.querySelector("#resolve-btn").addEventListener("click", () => {
  modal.style.display = "none";
  const form = document.querySelector(".solution-form form");
  if (form && currentIssue) {
    form.querySelector('input[type="text"]').value = currentIssue.title;
    form.querySelectorAll("input")[1].value = currentIssue.location;
    window.scrollTo({ top: form.offsetTop - 100, behavior: "smooth" });
  }
});


// === Handle Submit Solution Form ===
const solutionForm = document.querySelector(".solution-form form");
if (solutionForm) {
  const fileInput = solutionForm.querySelector('input[type="file"]');

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      let preview = solutionForm.querySelector(".preview-img");
      if (!preview) {
        preview = document.createElement("img");
        preview.className = "preview-img";
        preview.style.width = "100%";
        preview.style.marginTop = "10px";
        preview.style.borderRadius = "8px";
        solutionForm.appendChild(preview);
      }
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  solutionForm.addEventListener("submit", async e => {
    e.preventDefault();

    const title = solutionForm.querySelector('input[type="text"]').value;
    const desc = solutionForm.querySelector("textarea").value;
    const location = solutionForm.querySelectorAll("input")[1].value;
    const dept = solutionForm.querySelector("select").value;
    const file = fileInput.files[0];

    if (!title || !desc || !location || !dept) {
      showToast("⚠️ Please fill all fields.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("desc", desc);
    formData.append("location", location);
    formData.append("department", dept);
    if (file) formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5001/api/solutions", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      showToast("✅ Solution submitted successfully!", "success");
      solutionForm.reset();
      const preview = solutionForm.querySelector(".preview-img");
      if (preview) preview.remove();
      loadIssues();
    } catch (err) {
      showToast("❌ Failed to submit solution.", "error");
    }
  });
}


// === Toast Notification System ===
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


// === Create Toast Styles ===
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
      { tag: "Signals", color: "red", title: "Malfunctioning traffic signal at Grand & 3rd", time: "2m ago" },
      { tag: "Vehicles", color: "blue", title: "Abandoned vehicle on Maple Rd", time: "5m ago" },
      { tag: "Vandalism", color: "violet", title: "Graffiti on bridge at 12th St", time: "9m ago" },
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

// === Run all loaders ===
loadIssues();
loadLiveFeed();
