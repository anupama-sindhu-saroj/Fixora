import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CitizenAuth.css";

export default function CitizenLogin() {
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!emailOrUsername || !password)
      return alert("Please enter both email/username and password.");

    try {
      const response = await fetch("http://127.0.0.1:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("citizenToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login successful!");
        navigate("/dashboard/citizen");
      } else {
        alert("Login failed: " + (data.message || "INVALID CREDENTIALS"));
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong while logging in.");
    }
  }

  return (
    <div className="ca-page">
      <div className="ca-card">
        {/* Left */}
        <div className="ca-left citizen-left">
          <div className="ca-image-wrapper">
            <img src="/community2.png" alt="Login Illustration" />
          </div>
        </div>

        {/* Right */}
        <div className="ca-right">
          <h2 className="ca-heading">WELCOME BACK</h2>

          <form className="ca-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Email or Username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="ca-options">
              <span onClick={() => navigate("/forgot-password/citizen")}>
                Forgot Password?
              </span>
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