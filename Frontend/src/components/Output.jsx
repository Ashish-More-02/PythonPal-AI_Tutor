import React from "react";

const Output = ({ jsonResult, isExecuting, isDarkMode }) => {
  return (
    <div
      className={`mt-3 shrink-0 rounded-xl border p-4 max-h-[35vh] overflow-y-auto font-mono text-sm transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-950/80 border-gray-800 text-gray-200"
          : "bg-gray-50 border-gray-200 text-gray-900"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          Terminal Output
        </h3>
        {isExecuting && (
          <span className="text-xs text-amber-400 font-mono animate-pulse flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            Executing...
          </span>
        )}
      </div>

      {isExecuting ? (
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

