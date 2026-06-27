import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignupChoice from "./pages/SignupChoice";
import LoginChoice from "./pages/LoginChoice";
import CitizenSignup from "./pages/CitizenSignup";
import CitizenLogin from "./pages/CitizenLogin";
import CitizenForgotPassword from "./pages/ CitizenForgotPassword.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup-choice" element={<SignupChoice />} />
        <Route path="/login-choice" element={<LoginChoice />} />
        <Route path="/signup/citizen" element={<CitizenSignup />} />
        <Route path="/login/citizen" element={<CitizenLogin />} />
        <Route path="/forgot-password/citizen" element={<CitizenForgotPassword />} />
        {/* Authority routes and dashboards added next */}
      </Routes>
    </BrowserRouter>
  );
}