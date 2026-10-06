import React from "react";
import { FiSun, FiMoon, FiLogOut, FiCode } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ServerStatusPill from "./ServerStatusPill";

const Header = ({ setIsDarkMode, isDarkMode }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      className={`h-16 shrink-0 flex justify-between items-center px-6 border-b transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-900/90 border-gray-800 backdrop-blur-md"
          : "bg-white/90 border-gray-200 backdrop-blur-md"
      }`}
    >
      <div
        className="flex items-center gap-3 cursor-pointer"
        // From the dashboard the logo shows the landing page; everywhere else it goes back to the dashboard.
        onClick={() =>
          pathname === "/dashboard" ? navigate("/", { state: { showLanding: true } }) : navigate("/dashboard")
        }
      >
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
          PythonPal <span className="text-xl">🐍</span>
        </h1>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium hidden sm:inline-block ${
            isDarkMode
              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          AI Workspace
        </span>
      </div>

      <div className="flex items-center gap-3">
        <ServerStatusPill className="hidden md:inline-flex" />
        {/* Free Practice is one click away from anywhere, except when you're already in it */}
        {pathname !== "/app" && (
          <button
            onClick={() => navigate("/app")}
            className="flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-2 transition-all bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer"
          >
            <FiCode size={16} />
            <span className="hidden sm:inline">Free Practice</span>
          </button>
        )}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`p-2.5 rounded-xl transition-all border cursor-pointer ${
            isDarkMode
              ? "bg-gray-800/80 border-gray-700/60 text-amber-300 hover:bg-gray-700"
              : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-2 transition-all border cursor-pointer ${
            isDarkMode
              ? "bg-gray-800 border-gray-700/60 text-gray-200 hover:bg-gray-700"
              : "bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200"
          }`}
        >
          <FiLogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

