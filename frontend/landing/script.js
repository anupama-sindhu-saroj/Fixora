// ===============================
// Animate text letter by letter
// ===============================
function animateLetters(id, delayStep = 0.08, startDelay = 0) {
  const element = document.getElementById(id);
  const nodes = Array.from(element.childNodes);
  element.innerHTML = "";

  let charIndex = 0;

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split("").forEach(char => {
        const span = document.createElement("span");
        span.innerHTML = char === " " ? "&nbsp;" : char;
        span.classList.add("letter");
        span.style.animationDelay = `${startDelay + charIndex * delayStep}s`;
        element.appendChild(span);
        charIndex++;
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const wrapper = document.createElement("span");
      wrapper.className = node.className;
      element.appendChild(wrapper);

      node.textContent.split("").forEach(char => {
        const span = document.createElement("span");
        span.innerHTML = char;
        span.classList.add("letter");
        span.style.animationDelay = `${startDelay + charIndex * delayStep}s`;
        wrapper.appendChild(span);
        charIndex++;
      });
    }
  });
}

// ===============================
// Run animations
// ===============================
animateLetters("hero-title", 0.08, 0);
const heroTitleLength = document.getElementById("hero-title").innerText.length;
const subtitleDelay = heroTitleLength * 0.08 + 0.3;
animateLetters("hero-subtitle", 0.03, subtitleDelay);
const heroSubtitleLength = document.getElementById("hero-subtitle").innerText.length;
const buttonsStartDelay = heroTitleLength * 0.08 + heroSubtitleLength * 0.03 + 0.3;

document.querySelectorAll(".cta-buttons button").forEach((btn, i) => {
  btn.style.animationDelay = `${buttonsStartDelay + i * 0.2}s`;
});

// ===============================
// Navigation Buttons
// ===============================
document.getElementById("loginBtn").onclick = () => {
  window.location.href = "../login-choice.html";
};
document.getElementById("signupBtn").onclick = () => {
  window.location.href = "../signup-choice.html";
};
document.getElementById("reportBtn").onclick = () => {
  window.location.href = "../signup-choice.html";
};
document.getElementById("exploreBtn").onclick = () => {
  alert("Explore City feature coming soon!");
};

// ===============================
// Fetch Logo from Backend
// ===============================
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
      console.log("⚠️ No logo found in DB. Please upload with type=logo.");
    }
  })
  .catch(err => console.error("Logo fetch error:", err));

// === Fetch & Render Issues from Database ===
async function loadIssues() {
  try {
    const res = await fetch("http://localhost:5001/api/issues");
    const issues = await res.json();

    renderIssues(issues);
    renderMapIssues(issues); // Adds markers to the map
  } catch (err) {
    console.error("⚠️ Error fetching issues:", err);
  }
}

// === Render Issues inside 'Open Issues Log' ===
function renderIssues(issues) {
  const container = document.querySelector(".issue-list");
  if (!container) return;

  container.innerHTML = ""; // Clear old data

  if (issues.length === 0) {
    container.innerHTML = `<p class="muted">No issues found.</p>`;
    return;
  }

  issues.forEach((issue) => {
    const card = document.createElement("div");
    card.className = "issue-card";
    card.innerHTML = `
      <div>
        <h4>${issue.issueType || "Unknown Issue"}</h4>
        <p>${issue.description || "No description"}</p>
        <small>📍 ${issue.location || "Unknown Location"}</small>
      </div>
      <button class="view-btn" data-id="${issue._id}">View Details</button>
    `;
    container.appendChild(card);
  });
}

