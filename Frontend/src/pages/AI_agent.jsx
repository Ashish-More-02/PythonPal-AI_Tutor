import React from "react";
import PythonTutor from "../components/PythonTutor";
import Header from "../components/Header";
import { useDarkMode } from "../context/DarkModeContext";

const AI_agent = () => {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <Header setIsDarkMode={setIsDarkMode} isDarkMode={isDarkMode} />
      
      {/* Main Workspace Area */}
      <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        <PythonTutor />
      </main>
    </div>
  );
};

export default AI_agent;

