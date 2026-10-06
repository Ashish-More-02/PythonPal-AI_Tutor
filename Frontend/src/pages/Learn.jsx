// Component which handles , what to show either "Slides", "lessons" or "Projects" .
// the free practise is handled directly by "/app" page

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PythonTutor from "../components/PythonTutor";
import SlidesLesson from "../components/SlidesLesson";
import Header from "../components/Header";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";
import { learnApi } from "../API/learnAPI";

// A lesson or project. Opens the item here because its format decides the whole
// screen: slides get the reader, exercises get the editor workspace.
const Learn = () => {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const { token } = useAuth();
  const { itemId } = useParams();

  const [learnData, setLearnData] = useState(null); // { item, completedSteps, file }
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setError("");
    learnApi
      .openItem(itemId, token)
      .then(setLearnData)
      .catch((err) => setError(err.message));
  }, [itemId, token]);

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Header setIsDarkMode={setIsDarkMode} isDarkMode={isDarkMode} />
      <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        {error ? (
          <div className="m-4 p-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-sm">
            {error}
          </div>
        ) : !learnData || learnData.item.id !== itemId ? (
          // After "Next lesson" the old item is still in state until the new one loads — don't show it.
          <p className="m-4 text-sm text-gray-400 animate-pulse">Loading...</p>
        ) : learnData.item.format === "slides" ? (
          <SlidesLesson
            key={itemId}
            isDarkMode={isDarkMode}
            item={learnData.item}
            completedSteps={learnData.completedSteps}
          />
        ) : (
          // key: remount per item so no state leaks from the previous lesson
          <PythonTutor key={itemId} learnData={learnData} />
        )}
      </main>
    </div>
  );
};

export default Learn;
