import React from "react";

const Output = ({ jsonResult, isExecuting ,isDarkMode }) => {
  return (
    <div
      className={`p-4 mt-4 rounded-lg max-w-full overflow-hidden ${
        jsonResult?.message ? "bg-red-500/20" : "bg-green-500/20"
      }`}
    >
      <h1 className={`${isDarkMode ? "text-white" : "text-black"} text-lg font-semibold mb-2 `}>Output</h1>
      
      {isExecuting ? (
        <div className="text-gray-400">Executing Code...</div>
      ) : jsonResult?.run ? (
        <div className="space-y-2 p-2 max-w-full">
          <pre className="text-sm whitespace-pre-wrap break-words overflow-hidden">
            {jsonResult.run.output || "No output"}
          </pre>
          {jsonResult.run.stderr && (
            <pre className="text-red-400 text-sm whitespace-pre-wrap break-words overflow-hidden">
              Error: {jsonResult.run.stderr}
            </pre>
          )}
        </div>
      ) : (
        <div className="text-gray-400">No code executed yet</div>
      )}
    </div>
  );
};

export default Output;
