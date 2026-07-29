import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import Output from "./Output";

const CodeEditor = ({ isDarkMode, value, onChange, jsonResult, isExecuting }) => {
  return (
    <div className="flex-1 min-h-0 flex flex-col w-full overflow-hidden">
      {/* Editor Frame */}
      <div
        className={`flex-1 min-h-[200px] relative overflow-hidden rounded-xl border transition-colors duration-300 ${
          isDarkMode ? "border-gray-800 bg-gray-950" : "border-gray-200 bg-white"
        }`}
      >
        <Editor
          height="100%"
          theme={isDarkMode ? "vs-dark" : "vs-light"}
          defaultLanguage="python"
          defaultValue="# Welcome to PythonPal!\n print('Hello, Python World!')"
          value={value}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            padding: { top: 12, bottom: 12 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontFamily: "Fira Code, monospace",
          }}
        />
      </div>

      {/* Terminal Output Section */}
      <Output jsonResult={jsonResult} isExecuting={isExecuting} isDarkMode={isDarkMode} />
    </div>
  );
};

export default CodeEditor;

