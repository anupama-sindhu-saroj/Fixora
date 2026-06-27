import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CitizenAuth.css";

const API_BASE = "http://127.0.0.1:5001/api/authority";

export default function AuthoritySignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    name: "",
    city: "",
    password: "",
    authorityCode: "",
    otp: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  function showMessage(text, isError = false) {
    setMessage({ text, type: isError ? "error" : "success" });
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  }

  async function handleGetOtp() {
    const { email, name, city, password, authorityCode } = form;
    if (!email || !name || !city || !password || !authorityCode)
      return showMessage("All fields are required.", true);

    try {
      setOtpLoading(true);
      const res = await fetch(`${API_BASE}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message || "OTP sent to your email.");
        setOtpSent(true);
      } else {
        showMessage(data.message || "Error sending OTP", true);
      }
    } catch (err) {
      showMessage("Error: " + err.message, true);
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleVerify() {
    const { email, name, city, password, authorityCode, otp } = form;
    if (!otp) return showMessage("Please enter the OTP.", true);

    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, city, otp, password, authorityCode }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message || "Signup successful!");
        setTimeout(() => navigate("/login/authority"), 1500);
      } else {
        showMessage(data.message || "Verification failed.", true);
      }
    } catch (err) {
      showMessage("Error: " + err.message, true);
    }
  }

  return (
    <div className="ca-page">
      <div className="ca-signup-container">
        {/* Back Link */}
        <div className="ca-back-link" onClick={() => navigate("/signup-choice")}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Role Selection</span>
        </div>

        {/* Card */}
        <div className="ca-card">
          {/* Left */}
          <div className="ca-left authority-left">
            <h2>Authority Signup</h2>
            <p>Create your Authority account securely.</p>
            <img src="/community.png" alt="Authority Illustration" />
          </div>

          {/* Right */}
          <div className="ca-right">
            <h1 className="ca-heading">Authority Account</h1>
            <p className="ca-subtitle">Enter details to create your account.</p>

            {message.text && (
              <div className={`ca-message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={(e) => e.preventDefault()}>
              <input className="ca-input" type="email" id="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
              <input className="ca-input" type="text" id="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
              <input className="ca-input" type="text" id="city" placeholder="City" value={form.city} onChange={handleChange} required />
              <input className="ca-input" type="password" id="password" placeholder="Password" value={form.password} onChange={handleChange} required />
              <input className="ca-input" type="text" id="authorityCode" placeholder="Authority Code" value={form.authorityCode} onChange={handleChange} required />

              {!otpSent ? (
                <button type="button" className="ca-btn-primary" onClick={handleGetOtp} disabled={otpLoading}>
                  {otpLoading ? "Sending..." : "Get OTP"}
                </button>
              ) : (
                <div className="ca-otp-section">
                  <input type="text" id="otp" placeholder="Enter OTP" value={form.otp} onChange={handleChange} required />
                  <button type="button" className="ca-btn-success" onClick={handleVerify}>
                    Verify &amp; Sign Up
                  </button>
                </div>
              )}
            </form>

            <p className="ca-footer-link">
              Already have an account?{" "}
              <span onClick={() => navigate("/login/authority")}>Log In</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}