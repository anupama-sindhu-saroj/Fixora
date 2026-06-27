import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CitizenAuth.css";

export default function CitizenForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailLocked, setEmailLocked] = useState(false);

  async function handleSendOtp() {
    if (!email) return alert("Please enter your email");

    try {
      const res = await fetch("http://127.0.0.1:5001/api/auth/request-password-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("OTP sent to your email.");
        setEmailLocked(true);
        setOtpSent(true);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch {
      alert("Network error");
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Passwords do not match");

    try {
      const res = await fetch("http://127.0.0.1:5001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password reset successful!");
        navigate("/login/citizen");
      } else {
        alert(data.message || "Invalid OTP or error occurred");
      }
    } catch {
      alert("Network error");
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
          <h2 className="ca-heading">Forgot Password</h2>

          <form className="ca-form" onSubmit={handleReset}>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={emailLocked}
              required
            />

            <button type="button" className="ca-btn-primary" onClick={handleSendOtp} disabled={emailLocked}>
              Send OTP
            </button>

            {otpSent && (
              <div className="ca-otp-section">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="submit" className="ca-btn-success">Reset Password</button>
              </div>
            )}

            <p className="ca-footer-link">
              <span onClick={() => navigate("/login/citizen")}>&larr; Back to Login</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}