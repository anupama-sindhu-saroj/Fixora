import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CityDashboard from "./pages/CityDashboard";
import ReportIssue from "./pages/ReportIssue";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/city-dashboard" element={<CityDashboard />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}