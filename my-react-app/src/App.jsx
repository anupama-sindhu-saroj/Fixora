import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CityDashboard from "./pages/CityDashboard";
import ReportIssue from "./pages/ReportIssue";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Profile from "./pages/Profile";
import Chronicle from "./pages/Chronicle";
import SignupChoice from "./pages/SignupChoice";
import LoginChoice from "./pages/LoginChoice";
import CitizenSignup from "./pages/CitizenSignup";
import CitizenLogin from "./pages/CitizenLogin";
import CitizenForgotPassword from "./pages/CitizenForgotPassword";
import AuthoritySignup from "./pages/AuthoritySignup";
import AuthorityLogin from "./pages/AuthorityLogin";
import AuthorityForgotPassword from "./pages/AuthorityForgotPassword";
import AuthorityDashboard from "./pages/AuthorityDashboard";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/city-dashboard" element={<CityDashboard />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chronicle" element={<Chronicle />} />
        <Route path="/signup-choice" element={<SignupChoice />} />
        <Route path="/login-choice" element={<LoginChoice />} />
        <Route path="/signup/citizen" element={<CitizenSignup />} />
        <Route path="/login/citizen" element={<CitizenLogin />} />
        <Route path="/forgot-password/citizen" element={<CitizenForgotPassword />} />
        <Route path="/signup/authority" element={<AuthoritySignup />} />
        <Route path="/login/authority" element={<AuthorityLogin />} />
        <Route path="/forgot-password/authority" element={<AuthorityForgotPassword />} />
        <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}