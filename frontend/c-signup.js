const getOtpBtn = document.getElementById('getOtpBtn');
const otpSection = document.getElementById('otpSection');
const signupForm = document.getElementById('signupForm');
const messageBox = document.getElementById('messageBox');

function showMessage(msg, isError = false) {
  messageBox.textContent = msg;
  messageBox.classList.remove('hidden', 'error', 'success');
  messageBox.classList.add(isError ? 'error' : 'success');
}

// Request OTP
getOtpBtn.addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  if (!email) return showMessage("Please enter your email", true);
  if (password.length < 8) return showMessage("Password must be at least 8 characters", true);
  if (password !== confirmPassword) return showMessage("Passwords do not match", true);

  try {
    getOtpBtn.disabled = true;
    getOtpBtn.textContent = "Sending...";

    const res = await fetch('http://127.0.0.1:5001/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      credentials: "include"
    });

    const data = await res.json();

    if (res.ok) {
      showMessage("Verification code sent to your email.");
      document.getElementById('email').readOnly = true;
      otpSection.classList.remove('hidden');
      getOtpBtn.textContent = "Resend Verification Code";
    } else {
      showMessage(data.message || "Error sending OTP", true);
      getOtpBtn.disabled = false;
      getOtpBtn.textContent = "Get Verification Code";
    }
  } catch (err) {
    console.error(err);
    showMessage("Failed to send OTP", true);
    getOtpBtn.disabled = false;
    getOtpBtn.textContent = "Get Verification Code";
  }
});

// Final Signup
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const otp = document.getElementById('otp').value.trim();

  if (!otp) return showMessage("Please enter the verification code", true);

  try {
    const res = await fetch('http://127.0.0.1:5001/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, password, name, username }),
      credentials: "include"
    });

    const data = await res.json();

    if (res.ok) {
      showMessage("Signup successful!");
      localStorage.setItem("username", username);
<<<<<<< HEAD
      setTimeout(() => window.location.href = "../city-dashboard/city-dashboard.html", 1500);
=======
      setTimeout(() => window.location.href = "home.html", 1500);
>>>>>>> 5458181e8fcf8a0eb83dc9c40187d6181a2daf10
    } else {
      showMessage(data.message || "OTP verification failed", true);
    }
  } catch (err) {
    console.error(err);
    showMessage("Signup error", true);
  }
});
