import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CitizenAuth.css";

const API_BASE = "http://127.0.0.1:5001/api/authority";

export default function AuthorityLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ text: "Please enter both email and password.", type: "error" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Login successful!", type: "success" });
        localStorage.setItem("authorityToken", data.token);
        localStorage.setItem("authorityEmail", email);
        localStorage.setItem("authorityName", data.name);
        setTimeout(() => navigate("/authority-dashboard"), 1000);
      } else {
        setMessage({ text: data.message || "Invalid credentials.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error: " + err.message, type: "error" });
    }
  }

  return (
    <div className="ca-page">
      <div className="ca-card">
        {/* Left */}
        <div className="ca-left authority-left">
          <div className="ca-image-wrapper">
            <img src="/community2.png" alt="Authority Illustration" />
          </div>
        </div>

        {/* Right */}
        <div className="ca-right">
          <h2 className="ca-heading">Authority Login</h2>

          {message.text && (
            <div className={`ca-message ${message.type}`}>{message.text}</div>
          )}

          <form className="ca-form" onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <div className="ca-options">
              <span onClick={() => navigate("/forgot-password/authority")}>Forgot Password?</span>
            </div>

            <button type="submit" className="ca-btn-primary">Log In</button>

            <p className="ca-footer-link">
              Don't have an account?{" "}
              <span onClick={() => navigate("/signup-choice")}>Sign Up</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}