import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect user type from localStorage
  const isAuthority = !!localStorage.getItem("authorityToken");

  const navItems = [
    {
      label: "Dashboard",
      path: isAuthority ? "/authority-dashboard" : "/city-dashboard",
    },
    { label: "Chronicle Archive", path: "/chronicle" },
    { label: "Analytics", path: "/analytics" },
  ];

  return (
    <aside
      className={`w-64 text-slate-200 flex flex-col fixed h-full z-20 transition-transform transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
      style={{ background: "linear-gradient(145deg, #008080, #4a3ce0)" }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-white/20">
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h1 className="text-2xl font-bold ml-3 text-white">Fixora</h1>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 flex flex-col">
        <div className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  if (location.pathname !== item.path) navigate(item.path);
                }}
                className={`flex items-center px-4 py-3 rounded-lg font-medium w-full text-left transition-colors duration-200 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center px-4 py-3 rounded-lg font-medium text-slate-200 hover:bg-white/10 transition-colors duration-200"
        >
          Log Out
        </button>
      </nav>
    </aside>
  );
}