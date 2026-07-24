import { Link, Navigate } from "react-router-dom";
import { FiSun, FiMoon } from "react-icons/fi";
import { useDarkMode } from "../../context/DarkModeContext";
import { useAuth } from "../../context/AuthContext";

// The public homepage. Deliberately bare for now — app name, one-line pitch,
// and the two ways in. Real marketing copy / hero comes later.
const Landing = () => {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const { isAuthenticated } = useAuth();

  // Already logged in? Skip the homepage and go straight to the product.
  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* top bar */}
      <header className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          PythonPal 🐍
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-500/20 transition-colors"
          >
            {isDarkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
          <Link
            to="/signin"
            className={`text-sm font-semibold rounded-lg px-5 py-2 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Login
          </Link>
        </div>
      </header>

      {/* centered hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl sm:text-5xl font-bold max-w-2xl">
          Learn Python by building, not watching.
        </h2>
        <p
          className={`mt-4 max-w-xl text-lg ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          An AI mentor that reviews your code, guides your next step, and
          remembers your journey.
        </p>

        <div className="flex gap-4 mt-8">
          <Link
            to="/signup"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-8 py-3 transition-colors"
          >
            Register
          </Link>
          <Link
            to="/signin"
            className={`font-semibold rounded-lg px-8 py-3 transition-colors ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Login
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Landing;
