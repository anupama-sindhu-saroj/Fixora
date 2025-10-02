const getOtpBtn = document.getElementById('getOtpBtn');
const otpSection = document.getElementById('otpSection');
const signupForm = document.getElementById('signupForm');

getOtpBtn.addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();

  if (!email) return alert("Please enter your email");

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
      alert("OTP sent to your email.");
      document.getElementById('email').readOnly = true;
      getOtpBtn.disabled = true;
      otpSection.style.display = 'block';
    } else {
      alert(data.message || "Error sending OTP");
    }
  } catch (err) {
    alert("Failed to send OTP");
    console.error(err);
  }
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const otp = document.getElementById('otp').value.trim();

  if (password !== confirmPassword) {
    return alert("Passwords do not match");
  }

  try {
    const res = await fetch('http://127.0.0.1:5001/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, password, name, username }),
      credentials: "include"
    });

    const data = await res.json();

    if (res.ok) {
      alert("Signup successful!");
      localStorage.setItem("username",username);
      window.location.href = "home.html";
    } else {
      alert(data.message || "OTP verification failed");
    }
  } catch (err) {
    alert("Signup error");
    console.error(err);
  }
});
