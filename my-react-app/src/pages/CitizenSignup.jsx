import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CitizenAuth.css";

export default function CitizenSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [emailLocked, setEmailLocked] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  function showMessage(text, isError = false) {
    setMessage({ text, type: isError ? "error" : "success" });
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  }

  async function handleGetOtp() {
    const { email, password, confirmPassword } = form;
    if (!email) return showMessage("Please enter your email", true);
    if (password.length < 8) return showMessage("Password must be at least 8 characters", true);
    if (password !== confirmPassword) return showMessage("Passwords do not match", true);

    try {
      setOtpLoading(true);
      const res = await fetch("http://127.0.0.1:5001/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showMessage("Verification code sent to your email.");
        setEmailLocked(true);
        setOtpSent(true);
      } else {
        showMessage(data.message || "Error sending OTP", true);
      }
    } catch {
      showMessage("Failed to send OTP", true);
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { name, username, email, password, otp } = form;
    if (!otp) return showMessage("Please enter the verification code", true);

    try {
      const res = await fetch("http://127.0.0.1:5001/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password, name, username }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showMessage("Signup successful!");
        localStorage.setItem("username", username);
        setTimeout(() => navigate("/city-dashboard"), 1500);
      } else {
        showMessage(data.message || "OTP verification failed", true);
      }
    } catch {
      showMessage("Signup error", true);
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
          <div className="ca-left citizen-left">
            <h2>Your Voice, Your City.</h2>
            <img src="/community2.png" alt="Community Illustration" /> 

            <p>Join thousands of citizens making a real difference. Report issues, track progress, and build a better neighborhood, together.</p>
          </div>

          {/* Right */}
          <div className="ca-right">
            <h1 className="ca-heading">Fixora Citizen Account</h1>
            <p className="ca-subtitle">Create your account in seconds.</p>

            {message.text && (
              <div className={`ca-message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit}>
              {[
                { id: "name", label: "Full Name", type: "text" },
                { id: "email", label: "Email Address", type: "email" },
                { id: "username", label: "Username", type: "text" },
                { id: "password", label: "Password", type: "password" },
                { id: "confirmPassword", label: "Confirm Password", type: "password" },
              ].map(({ id, label, type }) => (
                <div className="ca-input-group" key={id}>
                  <input
                    type={type}
                    id={id}
                    placeholder=" "
                    value={form[id]}
                    onChange={handleChange}
                    readOnly={id === "email" && emailLocked}
                    required
                  />
                  <label htmlFor={id}>{label}</label>
                </div>
              ))}

              <button
                type="button"
                className="ca-btn-primary"
                onClick={handleGetOtp}
                disabled={otpLoading}
              >
                {otpLoading ? "Sending..." : otpSent ? "Resend Verification Code" : "Get OTP"}
              </button>

              {otpSent && (
                <div className="ca-otp-section">
                  <input
                    type="text"
                    id="otp"
                    placeholder="Enter OTP"
                    value={form.otp}
                    onChange={handleChange}
                    required
                  />
                  <button type="submit" className="ca-btn-success">Sign Up</button>
                </div>
              )}
            </form>

            <p className="ca-footer-link">
              Already have an account?{" "}
              <span onClick={() => navigate("/login/citizen")}>Log In</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}