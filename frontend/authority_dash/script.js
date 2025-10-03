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
      container.innerHTML = "";
      container.appendChild(img);
    } else {
      console.warn("⚠️ No logo found in DB. Please upload with type=logo.");
    }
  })
  .catch(err => console.error("Logo fetch error:", err));


// === Fetch logged-in authority details ===
const token = localStorage.getItem("authToken"); // token saved at login
if (token) {
  fetch("http://localhost:5001/api/auth/me", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(user => {
      if (user && user.name) {
        document.querySelector(".user-info span").textContent = user.name;
        document.querySelector(".dashboard-header h2").textContent = `Welcome, ${user.department || "Authority"}!`;
      }
    })
    .catch(err => console.error("❌ Error fetching authority details:", err));
} else {
  console.warn("⚠️ No token found. Redirecting to login...");
  // window.location.href = "../login-choice.html"; // uncomment if needed
}


// === Sidebar navigation switching ===
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".content-section");

navItems.forEach(item => {
  item.addEventListener("click", e => {
    e.preventDefault();
    navItems.forEach(nav => nav.classList.remove("active"));
    sections.forEach(sec => sec.classList.remove("active"));
    item.classList.add("active");
    const target = item.getAttribute("href");
    document.querySelector(target).classList.add("active");
  });
});


// Fake issue data (replace with backend later)
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

// Modal elements
const modal = document.getElementById("issue-modal");
const closeBtn = document.querySelector(".close-btn");

// Handle "View Details" button clicks
document.querySelectorAll(".issue-card").forEach(card => {
  card.querySelector(".view-btn").addEventListener("click", () => {
    const id = card.querySelector(".issue-id").innerText.replace("#", "");
    const issue = issues[id];

    if (!issue) return;

    // Fill modal with issue details
    document.getElementById("modal-title").innerText = issue.title;
    document.getElementById("modal-desc").innerText = issue.desc;
    document.getElementById("modal-reporter").innerText = issue.reporter;
    document.getElementById("modal-location").innerText = issue.location;
    document.getElementById("modal-image").src = issue.image;

    // Progress bar based on status
    const bar = document.getElementById("modal-progress");
    if (issue.status === "UP") bar.style.width = "33%";
    else if (issue.status === "Review") bar.style.width = "66%";
    else if (issue.status === "Resolved") bar.style.width = "100%";

    modal.style.display = "block";
  });
});

// Close modal
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
