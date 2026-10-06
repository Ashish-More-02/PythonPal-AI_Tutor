import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { learnApi } from "../API/learnAPI";

// Streamdown identity-compares its plugin set, so keep it a module constant.
const streamdownPlugins = { code };

// Read-only lesson (e.g. Lesson 0 "Why Python?"): one slide at a time, then
// "Mark as complete" on the last one. No editor, no Codey check.
const SlidesLesson = ({ isDarkMode, item, completedSteps }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [index, setIndex] = useState(0);
  const [isDone, setIsDone] = useState(completedSteps.length > 0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const slide = item.slides[index];
  const isFirst = index === 0;
  const isLast = index === item.slides.length - 1;
  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-600";

  // Arrow keys flip slides, like any presentation.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight")
        setIndex((i) => Math.min(i + 1, item.slides.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item.slides.length]);

  const goNext = () =>
    navigate(item.next ? `/learn/${item.next.id}` : "/dashboard");

  const handleComplete = async () => {
    // Already done: the button just moves on.
    if (isDone) return goNext();
    setIsSaving(true);
    setError("");
    try {
      await learnApi.completeItem(item.id, token);
      setIsDone(true);
      goNext();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const navButton = `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
    isDarkMode
      ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
      : "bg-gray-100 hover:bg-gray-200 border-gray-200"
  }`;

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 min-h-full">
        {/* Top bar: back, lesson label, slide count */}
        <div className="flex items-center justify-between gap-2 text-sm">
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-1.5 cursor-pointer hover:text-emerald-400 ${mutedText}`}
          >
            <FiArrowLeft /> Dashboard
          </button>
          <span className={mutedText}>
            Lesson {item.lessonNumber} · {item.title}
            {isDone && <FiCheck className="inline ml-1.5 text-emerald-400" />}
          </span>
          <span className={mutedText}>
            {index + 1} / {item.slides.length}
          </span>
        </div>

        {/* The slide */}
        <div
          className={`flex-1 rounded-2xl border p-6 sm:p-10 shadow-sm transition-colors duration-300 ${
            isDarkMode
              ? "bg-gray-900/70 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="text-5xl mb-4">{slide.emoji}</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">{slide.title}</h2>
          {/* key: remount per slide so Streamdown doesn't diff one slide into the next */}
          <div key={index} className="text-base leading-relaxed">
            <Streamdown plugins={streamdownPlugins}>{slide.body}</Streamdown>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Controls: prev, dots, next / complete */}
        <div className="flex items-center justify-between gap-3 pb-2">
          <button
            onClick={() => setIndex(index - 1)}
            disabled={isFirst}
            className={navButton}
          >
            <FiArrowLeft /> Back
          </button>

          <div className="hidden sm:flex items-center gap-1.5">
            {item.slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                title={s.title}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === index
                    ? "w-6 bg-emerald-500"
                    : `w-2 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={handleComplete}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : isDone
                  ? item.next
                    ? `Go to Lesson ${item.lessonNumber + 1}`
                    : "Back to Dashboard"
                  : item.next
                    ? `Mark complete & start Lesson ${item.lessonNumber + 1}`
                    : "Mark as complete"}
              <FiArrowRight />
            </button>
          ) : (
            <button onClick={() => setIndex(index + 1)} className={navButton}>
              Next <FiArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlidesLesson;
