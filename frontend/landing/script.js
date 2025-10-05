<<<<<<< HEAD
// Animate text letter by letter (supports inner spans like .fixora-highlight)
function animateLetters(id, delayStep = 0.08, startDelay = 0) {
    const element = document.getElementById(id);
    const nodes = Array.from(element.childNodes); // includes text + spans
    element.innerHTML = "";

    let charIndex = 0;

    nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            // Plain text ("Welcome to ")
            node.textContent.split("").forEach(char => {
                const span = document.createElement("span");
                span.innerHTML = char === " " ? "&nbsp;" : char;
                span.classList.add("letter");
                span.style.animationDelay = `${startDelay + charIndex * delayStep}s`;
                element.appendChild(span);
                charIndex++;
            });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Example: <span class="fixora-highlight">Fixora</span>
            const wrapper = document.createElement("span");
            wrapper.className = node.className; // keep "fixora-highlight"
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

// Run animation
animateLetters('hero-title', 0.08, 0);

// Animate subtitle after title finishes
const heroTitleLength = document.getElementById('hero-title').innerText.length;
const subtitleDelay = heroTitleLength * 0.08 + 0.3;
animateLetters('hero-subtitle', 0.03, subtitleDelay);

// Button animations (start after subtitle)
const heroSubtitleLength = document.getElementById('hero-subtitle').innerText.length;
const buttonsStartDelay = heroTitleLength * 0.08 + heroSubtitleLength * 0.03 + 0.3;

document.querySelectorAll('.cta-buttons button').forEach((btn, i) => {
    btn.style.animationDelay = `${buttonsStartDelay + i * 0.2}s`; 
});

// Button click events
document.getElementById('loginBtn').onclick = () => { window.location.href = '../login-choice.html'; };
document.getElementById('signupBtn').onclick = () => { window.location.href = '../signup-choice.html'; };
document.getElementById('reportBtn').onclick = () => { window.location.href = '../signup.html'; };
document.getElementById('exploreBtn').onclick = () => { alert("Explore City feature coming soon!"); };


=======
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
  window.location.href = "../signup.html";
};
document.getElementById("exploreBtn").onclick = () => {
  alert("Explore City feature coming soon!");
};

// ===============================
// Fetch Logo from Backend
// ===============================
>>>>>>> 5458181e8fcf8a0eb83dc9c40187d6181a2daf10
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

<<<<<<< HEAD




=======
if (res.ok) {
  message.style.color = "green";
  localStorage.setItem("authorityEmail", email);
  localStorage.setItem("authorityName", data.name);
  localStorage.setItem("role", "authority");
  localStorage.setItem("lastLogin", Date.now()); // 🕒 Add this
  setTimeout(() => {
    window.location.href = "../landing/index.html";
  }, 1000);
}
window.addEventListener("DOMContentLoaded", () => {
  // Get login data
  const authorityName = localStorage.getItem("authorityName");
  const citizenName = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  // Get nav button container
  const navButtons = document.querySelector(".nav-buttons");

  // If no user is logged in → show Login & Signup
  if (!authorityName && !citizenName) {
    console.log("No user logged in. Showing login/signup buttons.");
    return;
  }

  // Remove login/signup buttons
  navButtons.innerHTML = "";

  // Determine user details
  const userName = authorityName || citizenName;
  const userRole = role === "authority" ? "authority" : "citizen";

  // Create welcome text
  const welcomeText = document.createElement("span");
  welcomeText.className = "welcome-text";
  welcomeText.textContent = `Welcome, ${userName}`;

  // Create profile icon (first letter of name)
  const profileIcon = document.createElement("div");
  profileIcon.className = "profile-icon";
  profileIcon.textContent = userName.charAt(0).toUpperCase();

  // Create dashboard button
  const dashboardBtn = document.createElement("button");
  dashboardBtn.className = "dashboard-btn";
  dashboardBtn.textContent =
    userRole === "authority" ? "Authority Dashboard" : "Citizen Dashboard";
  dashboardBtn.onclick = () => {
    window.location.href =
      userRole === "authority"
        ? "../authority-dashboard/authority-dashboard.html"
        : "../citizen-dashboard/citizen.html";
  };

  // Create logout button
  const logoutBtn = document.createElement("button");
  logoutBtn.className = "logout-btn";
  logoutBtn.textContent = "Logout";
  logoutBtn.onclick = () => {
    localStorage.clear();
    window.location.reload(); // refresh to restore Login/Signup
  };

  // Append everything neatly
  navButtons.appendChild(welcomeText);
  navButtons.appendChild(profileIcon);
  navButtons.appendChild(dashboardBtn);
  navButtons.appendChild(logoutBtn);

  console.log(`Logged in as ${userRole}: ${userName}`);
});
>>>>>>> 5458181e8fcf8a0eb83dc9c40187d6181a2daf10
