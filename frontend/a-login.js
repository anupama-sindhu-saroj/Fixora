const API_BASE = "http://127.0.0.1:5001/api/authority";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

<<<<<<< HEAD
loginBtn.addEventListener("click", async (e) => {
  e.preventDefault(); // ✅ stop page reload
  console.log("🔵 Login button clicked");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  console.log("📩 Entered:", { email, password });

  if (!email || !password) {
    message.textContent = "Please enter both email and password.";
    console.warn("⚠️ Missing email or password");
=======
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    message.textContent = "Please enter both email and password.";
>>>>>>> 5458181e8fcf8a0eb83dc9c40187d6181a2daf10
    return;
  }

  try {
<<<<<<< HEAD
    console.log("🌐 Sending POST request to:", `${API_BASE}/login`);

    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    console.log("📥 Response status:", res.status);

    const data = await res.json();
    console.log("📦 Response data:", data);

    message.textContent = data.message || "Login response received.";

    if (res.ok) {
      console.log("✅ Login successful! Redirecting...");
      message.style.color = "green";
      localStorage.setItem("authorityEmail", email);
      localStorage.setItem("authorityName", data.name);

      setTimeout(() => {
        window.location.href = "authority_dash/index.html";
      }, 1000);
    } else {
      console.warn("❌ Login failed:", data.message);
      message.style.color = "red";
    }
  } catch (err) {
    console.error("🚨 Fetch error:", err);
=======
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
>>>>>>> 5458181e8fcf8a0eb83dc9c40187d6181a2daf10
    message.textContent = "Error: " + err.message;
  }
});
