const API_BASE = "http://127.0.0.1:5001/api/authority";

const emailInput = document.getElementById("email");
const requestOtpBtn = document.getElementById("requestOtpBtn");
const verifyBtn = document.getElementById("verifyBtn");
const otpSection = document.getElementById("otp-section");
const message = document.getElementById("message");

requestOtpBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const name = document.getElementById("name").value.trim();
  const city = document.getElementById("city").value.trim();
  const password = document.getElementById("password").value.trim();
  const authorityCode = document.getElementById("authorityCode").value.trim();

  if (!email || !name || !city || !password || !authorityCode) {
    message.textContent = "All fields are required.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    message.textContent = data.message;

    if (res.ok) {
      otpSection.style.display = "block";
      verifyBtn.style.display = "block";
      requestOtpBtn.style.display = "none";
    }
  } catch (err) {
    message.textContent = "Error: " + err.message;
  }
});

verifyBtn.addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const city = document.getElementById("city").value.trim();
  const otp = document.getElementById("otp").value.trim();
  const password = document.getElementById("password").value.trim();
  const email = emailInput.value.trim();
  const authorityCode = document.getElementById("authorityCode").value.trim();

  if (!otp) {
    message.textContent = "Please enter the OTP.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, city, otp, password, authorityCode })
    });

    const data = await res.json();
    message.textContent = data.message;

    if (res.ok) {
      message.style.color = "green";
      setTimeout(() => {
        window.location.href = "authority-login.html";
      }, 1500);
    }
  } catch (err) {
    message.textContent = "Error: " + err.message;
  }
});
