const sendOtpBtn = document.getElementById("sendOtpBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const otpSection = document.getElementById("otpSection");

sendOtpBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  if (!email) return alert("Please enter your email");

  try {
    const res = await fetch("http://127.0.0.1:5001/api/auth/request-password-reset-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (res.ok) {
      alert("OTP sent to your email.");
      document.getElementById("email").readOnly = true;
      sendOtpBtn.disabled = true;
      otpSection.style.display = "block";
    } else {
      alert(data.message || "Failed to send OTP");
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
});

resetPasswordBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const otp = document.getElementById("otp").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (newPassword !== confirmPassword) return alert("Passwords do not match");

  try {
    const res = await fetch("http://127.0.0.1:5001/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword })
    });

    const data = await res.json();
    if (res.ok) {
      alert("Password reset successful!");
      window.location.href = "login.html";
    } else {
      alert(data.message || "Invalid OTP or error occurred");
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
});
 