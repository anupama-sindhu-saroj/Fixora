const API_BASE = "http://127.0.0.1:5001/api/authority";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    message.textContent = "Please enter both email and password.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    message.textContent = data.message;

    if (res.ok) {
      message.style.color = "green";
      localStorage.setItem("authorityEmail", email);
      localStorage.setItem("authorityName", data.name);
      setTimeout(() => {
        window.location.href = "authority-dashboard.html"; // Redirect to authority dashboard
      }, 1000);
    }
  } catch (err) {
    message.textContent = "Error: " + err.message;
  }
});
