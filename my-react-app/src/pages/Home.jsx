import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";

export default function Home() {
  const navigate = useNavigate();
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  // Animate letters helper
  function animateLetters(element, delayStep = 0.08, startDelay = 0) {
    if (!element) return 0;
    const nodes = Array.from(element.childNodes);
    element.innerHTML = "";
    let charIndex = 0;

    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split("").forEach((char) => {
          const span = document.createElement("span");
          span.innerHTML = char === " " ? "&nbsp;" : char;
          span.classList.add("letter");
          span.style.animationDelay = `${startDelay + charIndex * delayStep}s`;
          element.appendChild(span);
          charIndex++;
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const wrapper = document.createElement("span");
        wrapper.className = node.className;
        element.appendChild(wrapper);

        node.textContent.split("").forEach((char) => {
          const span = document.createElement("span");
          span.innerHTML = char;
          span.classList.add("letter");
          span.style.animationDelay = `${startDelay + charIndex * delayStep}s`;
          wrapper.appendChild(span);
          charIndex++;
        });
      }
    });

    return charIndex;
  }

  useEffect(() => {
    // Animate title
    const titleLen = animateLetters(titleRef.current, 0.08, 0);
    const subtitleDelay = titleLen * 0.08 + 0.3;

    // Animate subtitle
    const subtitleLen = animateLetters(subtitleRef.current, 0.03, subtitleDelay);
    const buttonsStartDelay = titleLen * 0.08 + subtitleLen * 0.03 + 0.3;

    // Animate CTA buttons
    document.querySelectorAll(".cta-buttons button").forEach((btn, i) => {
      btn.style.animationDelay = `${buttonsStartDelay + i * 0.2}s`;
    });

    // Fetch logo from backend
    fetch("http://localhost:5001/api/files?type=logo")
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0 && logoRef.current) {
          const img = document.createElement("img");
          img.src = data[0].url;
          img.alt = "Fixora Logo";
          img.width = 150;
          logoRef.current.innerHTML = "";
          logoRef.current.appendChild(img);
        }
      })
      .catch((err) => console.error("Logo fetch error:", err));
  }, []);

  return (
    <div className="home-page">
      {/* Header */}
      <div className="home-header">
        <div className="logo" ref={logoRef}></div>
        <div className="nav-buttons">
          <button onClick={() => navigate("/login-choice")}>Login</button>
          <button onClick={() => navigate("/signup-choice")}>Sign Up</button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-box">
          <h1 ref={titleRef}>
            Welcome to <span className="fixora-highlight">Fixora</span>
          </h1>
          <p ref={subtitleRef}>Tracking and fixing the city's daily troubles.</p>
        </div>

        <div className="cta-buttons">
          <button
            className="report-btn"
            onClick={() => navigate("/signup-choice")}
          >
            Report Issue
          </button>
          <button
            className="explore-btn"
            onClick={() => alert("Explore City feature coming soon!")}
          >
            Explore City
          </button>
        </div>
      </section>

      {/* Bottom Stats Bar */}
      <footer className="stats-bar">
        <div className="stat">
          <h2>12.5K</h2>
          <p>Issues Reported</p>
        </div>
        <div className="stat">
          <h2>8.2K</h2>
          <p>Resolved Issues</p>
        </div>
        <div className="stat">
          <h2>4.3K</h2>
          <p>Working Issues</p>
        </div>
      </footer>
    </div>
  );
}
