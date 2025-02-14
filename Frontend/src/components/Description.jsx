import React from "react";

const Description = ({ isDarkMode, setIsDarkMode }) => {
  return (
    <div
      className={`p-6 rounded-xl font-mono ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } shadow-xl`}
    >
      <h2 className="text-2xl font-semibold mb-4">Welcome to PythonPal! 🚀</h2>
      <p className={`mb-4  ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
        PythonPal is an interactive learning platform that makes Python
        programming fun and accessible for kids. Our AI tutor adapts to your
        learning pace with engaging lessons and real-time feedback.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`p-4 rounded-lg ${
            isDarkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <h3 className="font-semibold mb-2">Features ✨</h3>
          <ul className="space-y-1">
            <li>🎮 Interactive Challenges</li>
            <li>🧑🏻‍🏫 Personalized tutor</li>
            <li>🤖 AI-Powered Help</li>
          </ul>
        </div>
        <div
          className={`p-4 rounded-lg ${
            isDarkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <h3 className="font-semibold mb-2">Getting Started 🐣</h3>
          <ul className="space-y-1">
            <li>1. Set your API key</li>
            <li>2. Ask coding questions</li>
            <li>3. Complete challenges</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-blue-300 pt-4 flex justify-center text-sm">
        powerd by
        <p className="bg-gray-700 text-cyan-400 px-1 rounded-md ">
          llama-3.3-70b-versatile
        </p>
        and
        <p className="bg-gray-700 text-cyan-400 px-1 rounded-md">groq cloud</p>.
      </div>
    </div>
  );
};

export default Description;
