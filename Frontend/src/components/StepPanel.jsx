import React from "react";
import { useNavigate } from "react-router-dom";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { FiArrowLeft, FiCheck, FiArrowRight } from "react-icons/fi";

// Same reason as in PythonTutor: Streamdown identity-compares its plugin set.
const streamdownPlugins = { code };

// Left panel for a lesson or project: the current step's explanation, task and
// Codey's review.
// Purely presentational — PythonTutor owns the code, the run and the check call.
const StepPanel = ({
  isDarkMode,
  item,
  completedSteps,
  stepIndex,
  onSelectStep,
  onCheck,
  isChecking,
  review,
}) => {
  const navigate = useNavigate();

  if (!item) {
    return <p className="text-sm text-gray-400 animate-pulse">Loading...</p>;
  }

  const step = item.steps[stepIndex];
  const isStepDone = completedSteps.includes(step.id);
  const isLastStep = stepIndex === item.steps.length - 1;
  const allDone = item.steps.every((s) => completedSteps.includes(s.id));
  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Project header + step dots */}
      <div className="shrink-0 pb-3 mb-3 border-b border-gray-700/20 space-y-3">
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex items-center gap-1.5 text-xs cursor-pointer hover:text-emerald-400 ${mutedText}`}
        >
          <FiArrowLeft /> Dashboard
        </button>

        {/*  */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {item.kind === "lesson" ? `Lesson ${item.lessonNumber}` : "Project"}
            </p>
            <h2 className="font-semibold">{item.title}</h2>
          </div>
          <span className={`text-xs ${mutedText}`}>
            {completedSteps.length}/{item.steps.length} done
          </span>
          
          {/*  */}
        </div>
        <div className="flex items-center gap-1.5">
          {item.steps.map((s, i) => {
            const done = completedSteps.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => onSelectStep(i)}
                title={s.title}
                className={`h-7 w-7 rounded-full text-xs font-semibold flex items-center justify-center border cursor-pointer transition-all ${
                  done
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-300"
                    : "bg-gray-100 border-gray-200 text-gray-700"
                } ${i === stepIndex ? "ring-2 ring-emerald-400/70" : ""}`}
              >
                {done ? <FiCheck /> : i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lesson */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-600">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Step {stepIndex + 1}
          </p>
          <h3 className="text-base font-semibold mt-0.5">{step.title}</h3>
        </div>

        <Streamdown plugins={streamdownPlugins}>{step.explanation}</Streamdown>

        <div
          className={`rounded-xl border p-3 ${
            isDarkMode ? "bg-emerald-950/30 border-emerald-800/50" : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            Your task
          </p>
          <p>{step.task}</p>
        </div>

        {/* Codey's review of the last check */}
        {review && (
          <div
            className={`rounded-xl border p-3 space-y-2 ${
              review.error
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : review.passed
                ? "bg-emerald-500/10 border-emerald-500/40"
                : "bg-amber-500/10 border-amber-500/40"
            }`}
          >
            {review.error ? (
              <p>{review.error}</p>
            ) : (
              <>
                <p className="font-semibold">{review.passed ? "✅ Step done!" : "🤔 Not quite yet"}</p>
                <p>{review.feedback}</p>
                {review.hint && (
                  <p className={mutedText}>
                    <span className="font-semibold">Hint:</span> {review.hint}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {allDone && isLastStep && isStepDone && (
          <div className="rounded-xl border border-emerald-500/40 p-3 bg-emerald-500/10 space-y-1">
            {item.kind === "lesson" ? (
              <>
                <p className="font-semibold">🎉 Lesson complete!</p>
                <p className={mutedText}>
                  {item.next
                    ? `Up next: ${item.next.title}.`
                    : "That's all of Python Basics! Try a project next, or build your own thing in Free Practice."}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">🎉 You built a whole program!</p>
                <p className={mutedText}>
                  It&apos;s saved in your projects folder in Free Practice. Try changing it and making it your own.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 pt-3 mt-3 border-t border-gray-700/20 flex items-center gap-2">
        <button
          onClick={onCheck}
          disabled={isChecking}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50 cursor-pointer"
        >
          {isChecking ? "Codey is checking..." : isStepDone ? "Check again" : "Check my code"}
        </button>
        {isStepDone && isLastStep && item.next && (
          <button
            onClick={() => navigate(`/learn/${item.next.id}`)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                : "bg-gray-100 hover:bg-gray-200 border-gray-200"
            }`}
          >
            Next lesson <FiArrowRight />
          </button>
        )}
        {isStepDone && !isLastStep && (
          <button
            onClick={() => onSelectStep(stepIndex + 1)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                : "bg-gray-100 hover:bg-gray-200 border-gray-200"
            }`}
          >
            Next <FiArrowRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default StepPanel;
