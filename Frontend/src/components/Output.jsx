import React, { useState, useEffect } from "react";

const Output = ({ jsonResult, isExecuting, isDarkMode, stdin, onStdinChange }) => {
  const [activeTab, setActiveTab] = useState("output");

  // Jump to Output the moment a run starts, so a result never stays hidden
  // behind the Input tab.
  useEffect(() => {
    if (isExecuting) setActiveTab("output");
  }, [isExecuting]);

  const tabClass = (tab) =>
    `px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
      activeTab === tab
        ? isDarkMode
          ? "bg-gray-800 text-gray-100"
          : "bg-gray-200 text-gray-900"
        : "text-gray-400 hover:text-gray-300"
    }`;

  return (
    <div
      className={`mt-3 shrink-0 rounded-xl border p-4 max-h-[35vh] overflow-y-auto font-mono text-sm transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-950/80 border-gray-800 text-gray-200"
          : "bg-gray-50 border-gray-200 text-gray-900"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("input")}
            className={tabClass("input")}
            title="Text your program reads with input()"
          >
            <span className="flex items-center gap-1.5">
              Input
              {/* A dot means something is waiting to be fed in, so an empty
                  input() crash is easy to spot before running. */}
              {stdin?.trim() && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("output")}
            className={tabClass("output")}
          >
            Output
          </button>
        </div>

        {isExecuting && (
          <span className="text-xs text-amber-400 font-mono animate-pulse flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            Executing...
          </span>
        )}
      </div>

      {activeTab === "input" ? (
        <div className="space-y-2">
          <textarea
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            spellCheck={false}
            rows={5}
            placeholder={"Type what your program should read.\nOne answer per line, in the order input() asks for them."}
            className={`w-full resize-y rounded-lg border p-2.5 font-mono text-sm outline-none transition-colors focus:border-emerald-500/60 ${
              isDarkMode
                ? "bg-gray-900/60 border-gray-800 text-gray-200 placeholder:text-gray-600"
                : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            }`}
          />
          <p className="text-[11px] text-gray-500 italic">
            Your program can't stop and ask while it runs, so put every answer here before you press Run.
          </p>
        </div>
      ) : isExecuting ? (
        <div className="text-sm font-mono text-gray-400 py-1">Running Python script...</div>
      ) : jsonResult?.run ? (
        <div className="space-y-2 font-mono text-sm">
          {jsonResult.run.output ? (
            <pre className="whitespace-pre-wrap break-words text-emerald-400 font-mono">
              {jsonResult.run.output}
            </pre>
          ) : (
            <div className="text-gray-500 italic text-xs">Program finished with no output.</div>
          )}
          {jsonResult.run.stderr && (
            <pre className="whitespace-pre-wrap break-words text-red-400 pt-1 border-t border-red-500/20 font-mono">
              {jsonResult.run.stderr}
            </pre>
          )}
        </div>
      ) : jsonResult?.message ? (
        <div className="text-sm font-mono text-red-400">{jsonResult.message}</div>
      ) : (
        <div className="text-xs font-mono text-gray-500 italic">
          Run code to see output results here.
        </div>
      )}
    </div>
  );
};

export default Output;
