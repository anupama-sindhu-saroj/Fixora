import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignupChoice from "./pages/SignupChoice";
import LoginChoice from "./pages/LoginChoice";
import CitizenSignup from "./pages/CitizenSignup";
import CitizenLogin from "./pages/CitizenLogin";
import CitizenForgotPassword from "./pages/CitizenForgotPassword";
import AuthoritySignup from "./pages/AuthoritySignup";
import AuthorityLogin from "./pages/AuthorityLogin";
import AuthorityForgotPassword from "./pages/AuthorityForgotPassword";

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
        <Route path="/signup/authority" element={<AuthoritySignup />} />
        <Route path="/login/authority" element={<AuthorityLogin />} />
        <Route path="/forgot-password/authority" element={<AuthorityForgotPassword />} />
        {/* Dashboards added next */}
      </Routes>
    </BrowserRouter>
  );
}