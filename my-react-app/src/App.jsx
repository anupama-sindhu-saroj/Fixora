import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignupChoice from "./pages/SignupChoice.jsx";
import LoginChoice from "./pages/LoginChoice.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup-choice" element={<SignupChoice />} />
        <Route path="/login-choice" element={<LoginChoice />} />
        {/* More routes added here as we build each page */}
      </Routes>
    </BrowserRouter>
  );
}