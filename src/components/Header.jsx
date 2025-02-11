import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const Header = ({setIsDarkMode , isDarkMode}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
        PythonPal 🐍
      </h1>
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="p-2 rounded-full hover:bg-gray-700/20 transition-colors"
      >
        {isDarkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
      </button>
    </div>
  );
};

export default Header;
