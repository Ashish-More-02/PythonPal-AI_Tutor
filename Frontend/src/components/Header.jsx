import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { Link } from "react-router-dom";
import SignIn from "./SignIn";

const Header = ({ setIsDarkMode, isDarkMode }) => {
  console.log(isDarkMode);
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
        PythonPal 🐍
      </h1>
      <div className="flex items-center justify-center">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-gray-700/20 transition-colors"
        >
          {isDarkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>
        <Link className="" to="signin">
          <p
            className={`text-md font-semibold mx-2 rounded-lg px-6 py-2 ${
              isDarkMode ? "bg-gray-600 hover:bg-gray-700" : "bg-gray-200 text-black hover:bg-gray-300 "
            } `}
          >
            Login
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Header;
