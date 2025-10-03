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
  })
    .then(res => res.json())
    .then(user => {
      if (user && user.name) {
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
