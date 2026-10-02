import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";
import ServerBootNotice from "./ServerBootNotice";
import ServerStatusPill from "./ServerStatusPill";
import { FiEye, FiEyeOff } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cnfpassword, setCnfPassword] = useState("");
  const [showCnfPassword, setShowCnfPassword] = useState(false);
  const [error, setError] = useState(""); // red banner
  const [isSubmitting, setIsSubmitting] = useState(false); // disables the button

  const {isDarkMode} = useDarkMode();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // Client-only checks (the server never sees the confirm field).
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in every field.");
      return;
    }
    if (password !== cnfpassword) {
      setError("The two passwords don't match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Backend hands back a token, so registering logs you straight in.
        login(data.user, data.token);
        navigate("/dashboard");
      } else {
        // Specific backend message: weak password, email taken, invalid email...
        setError(data.error || "Sign up failed. Please try again.");
      }
    } catch (err) {
      setError("Can't reach the server. Please check it's running and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Same surface, card and button language as the landing page; `landing` opts into its reduced-motion rules.
  const MainStyle = `landing relative isolate min-h-dvh w-full flex flex-col overflow-hidden ${isDarkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`;
  const FormStyle = `w-full max-w-md rounded-2xl border p-6 sm:p-8 shadow-xl backdrop-blur ${isDarkMode ? "bg-gray-900/70 border-gray-800 shadow-black/30" : "bg-white/90 border-gray-200 shadow-gray-200/60"}`;
  const inputStyle = `w-full rounded-xl border px-3.5 py-2.5 mt-1.5 mb-4 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 ${isDarkMode ? "bg-gray-800/80 border-gray-700 placeholder-gray-500" : "bg-gray-50 border-gray-300 placeholder-gray-400"}`;
  const labelStyle = "text-sm font-semibold";
  const mutedStyle = isDarkMode ? "text-gray-400" : "text-gray-600";
  const errorStyle = `rounded-xl border border-red-500/40 bg-red-500/10 p-3 my-2 text-sm ${isDarkMode ? "text-red-300" : "text-red-700"}`;
  const buttonStyle = "w-full mt-2 inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg rounded-xl py-2.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none";

  return (
    <div className={MainStyle}>
      {/* background: grid + drifting blobs, as on the landing hero */}
      <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 landing-grid" />
        <div className="absolute -top-24 -left-24 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-emerald-500/20 blur-3xl animate-blob" />
        <div className="absolute bottom-0 -right-24 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-blue-500/20 blur-3xl animate-blob [animation-delay:-5s]" />
      </div>

      <header className="w-full max-w-6xl mx-auto flex items-center justify-between gap-2 px-4 sm:px-6 py-3">
        <Link
          to="/"
          state={{ showLanding: true }}
          className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-green-400 bg-[length:200%_auto] bg-clip-text text-transparent transition-[background-position] duration-700 hover:bg-right"
        >
          PythonPal 🐍
        </Link>
        <ServerStatusPill compact />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className={FormStyle}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">Create your account</h1>
          <p className={`text-center mt-1 mb-6 ${mutedStyle}`}>Start learning Python with Codey.</p>
          <form className="w-full" onSubmit={handleSignUp}>
            <label className={labelStyle}>Full Name</label>
            <input
              className={inputStyle}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <label className={labelStyle}>Email Address</label>
            <input
              className={inputStyle}
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <label className={labelStyle}>Password</label>
            <div className="relative">
              <input
                className={`${inputStyle} pr-11`}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
              {/* top/bottom offsets match the input's mt-1.5 / mb-4 so the icon centres on the box */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className={`absolute right-0 top-1.5 bottom-4 px-3 flex items-center cursor-pointer transition-colors hover:text-emerald-500 ${mutedStyle}`}
              >
                {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
              </button>
            </div>
            <label className={labelStyle}>Confirm Password</label>
            <div className="relative">
              <input
                className={`${inputStyle} pr-11`}
                type={showCnfPassword ? "text" : "password"}
                value={cnfpassword}
                onChange={(e) => {
                  setCnfPassword(e.target.value);
                }}
              />
              {/* top/bottom offsets match the input's mt-1.5 / mb-4 so the icon centres on the box */}
              <button
                type="button"
                onClick={() => setShowCnfPassword(!showCnfPassword)}
                aria-label={showCnfPassword ? "Hide password" : "Show password"}
                className={`absolute right-0 top-1.5 bottom-4 px-3 flex items-center cursor-pointer transition-colors hover:text-emerald-500 ${mutedStyle}`}
              >
                {showCnfPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
              </button>
            </div>

            <ServerBootNotice />

            {error && (
              <div className={errorStyle}>
                {error}
              </div>
            )}

            <button
              className={buttonStyle}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>
            <div className={`flex flex-wrap items-center justify-center gap-1 mt-6 text-sm ${mutedStyle}`}>
              <p>Already have an account?</p>
              <Link to="/signin" className="font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
                Login
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
