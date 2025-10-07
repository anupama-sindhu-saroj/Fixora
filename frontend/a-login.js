const API_BASE = "http://127.0.0.1:5001/api/authority";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

loginBtn.addEventListener("click", async (e) => {
  e.preventDefault(); // stop reload
  console.log("🔵 Login button clicked");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    message.textContent = "Please enter both email and password.";
    return;
  }

  try {
    console.log("🌐 Sending POST request to:", `${API_BASE}/login`);

    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("📦 Response data:", data);

    if (res.ok) {
      console.log("✅ Login successful! Redirecting...");
      message.textContent = "Login successful!";
      message.style.color = "green";

      // 🟢 Save the token & authority details
      localStorage.setItem("authorityToken", data.token);
      localStorage.setItem("authorityEmail", email);
      localStorage.setItem("authorityName", data.name);

      setTimeout(() => {
        window.location.href = "authority_dash/index.html";
      }, 1000);
    } else {
      console.warn("❌ Login failed:", data.message);
      message.style.color = "red";
      message.textContent = data.message || "Invalid credentials.";
    }
  } catch (err) {
    console.error("🚨 Fetch error:", err);
    message.textContent = "Error: " + err.message;
  }
});
