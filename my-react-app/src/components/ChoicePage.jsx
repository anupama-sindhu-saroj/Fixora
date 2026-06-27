import { useNavigate } from "react-router-dom";
import "./ChoicePage.css";

export default function ChoicePage({ mode }) {
  const navigate = useNavigate();
  const isSignup = mode === "signup";

  const citizenPath = isSignup ? "/signup/citizen" : "/login/citizen";
  const authorityPath = isSignup ? "/signup/authority" : "/login/authority";

  return (
    <div className="choice-page">
      <div className="choice-container">
        <h1 className="choice-title">
          Welcome to <span className="choice-brand">Fixora</span>
        </h1>
        <p className="choice-subtitle">
          Please choose your primary role to continue.
        </p>

        <div className="choice-cards">
          {/* Citizen Card */}
          <div
            className="choice-box citizen"
            onClick={() => navigate(citizenPath)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(citizenPath)}
          >
            <div className="icon-box citizen-icon">
              <svg
                className="choice-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h2 className="choice-role citizen-label">Citizen</h2>
            <p className="choice-desc">
              Report new issues and track city improvements in your neighborhood.
            </p>
            <div className="choice-cta citizen-cta">I want to Report &amp; Track</div>
          </div>

          {/* Authority Card */}
          <div
            className="choice-box authority"
            onClick={() => navigate(authorityPath)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(authorityPath)}
          >
            <div className="icon-box authority-icon">
              <svg
                className="choice-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 00-6.702 1.033L3 6l9 18 9-18-2.618-2.016z"
                />
              </svg>
            </div>
            <h2 className="choice-role authority-label">Authority</h2>
            <p className="choice-desc">
              Manage incoming reports, approve fixes, and coordinate resolutions
              across the city.
            </p>
            <div className="choice-cta authority-cta">
              I want to Manage &amp; Resolve
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}