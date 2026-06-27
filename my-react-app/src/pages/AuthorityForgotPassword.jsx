import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CitizenAuth.css";

const API_BASE = "http://127.0.0.1:5001/api/authority";

export default function AuthorityForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  function showMessage(text, isError = false) {
    setMessage({ text, type: isError ? "error" : "success" });
  }

  async function handleSendOtp() {
    if (!email) return showMessage("Please enter your email.", true);

    try {
      const res = await fetch(`${API_BASE}/request-password-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message || "OTP sent to your email.");
        setOtpSent(true);
      } else {
        showMessage(data.message || "Failed to send OTP.", true);
      }
    } catch (err) {
      showMessage("Error: " + err.message, true);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword)
      return showMessage("All fields are required.", true);
    if (newPassword !== confirmPassword)
      return showMessage("Passwords do not match.", true);

    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message || "Password reset successful!");
        setTimeout(() => navigate("/login/authority"), 1500);
      } else {
        showMessage(data.message || "Invalid OTP or error occurred.", true);
      }
    } catch (err) {
      showMessage("Error: " + err.message, true);
    }
  }

  return (
    <div className="ca-page">
      <div className="ca-card">
        {/* Left */}
        <div className="ca-left forgot-left">
          <div className="ca-image-wrapper">
            <img src="/community3.png" alt="Forgot Password Illustration" />
          </div>
        </div>

        {/* Right */}
        <div className="ca-right">
          <h2 className="ca-heading">Authority Forgot Password</h2>

          {message.text && (
            <div className={`ca-message ${message.type}`}>{message.text}</div>
          )}

          <form className="ca-form" onSubmit={handleReset}>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={otpSent}
              required
            />

            {!otpSent ? (
              <button type="button" className="ca-btn-primary" onClick={handleSendOtp}>
                Send OTP
              </button>
            ) : (
              <div className="ca-otp-section">
                <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="submit" className="ca-btn-success">Reset Password</button>
              </div>
            )}

            <p className="ca-footer-link">
              <span onClick={() => navigate("/login/authority")}>&larr; Back to Login</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}