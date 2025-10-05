document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://127.0.0.1:5001/api/authority";

  const emailInput = document.getElementById("email");
  const requestOtpBtn = document.getElementById("requestOtpBtn");
  const resetPasswordSection = document.getElementById("reset-password-section");
  const otpInput = document.getElementById("otp");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const resetPasswordBtn = document.getElementById("resetPasswordBtn");
  const message = document.getElementById("message");

  if (!emailInput || !requestOtpBtn || !resetPasswordBtn || !message) {
    console.error("❌ Missing HTML elements. Check your element IDs.");
    return;
  }

  requestOtpBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) {
      message.textContent = "Please enter your email.";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/request-password-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      message.textContent = data.message;

      if (res.ok) {
        requestOtpBtn.style.display = "none";
        resetPasswordSection.style.display = "block";
      }
    } catch (err) {
      message.textContent = "Error: " + err.message;
    }
  });

  resetPasswordBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const otp = otpInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!otp || !newPassword || !confirmPassword) {
      message.textContent = "All fields are required.";
      return;
    }

    if (newPassword !== confirmPassword) {
      message.textContent = "Passwords do not match.";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await res.json();
      message.textContent = data.message;

      if (res.ok) {
        message.style.color = "green";
        setTimeout(() => window.location.href = "a-login.html", 1500);
      }
    } catch (err) {
      message.textContent = "Error: " + err.message;
    }
  });
});
