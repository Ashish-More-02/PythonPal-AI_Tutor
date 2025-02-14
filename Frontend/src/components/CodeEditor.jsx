import React, { useRef, useState } from "react";
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import Output from "./Output";

const CodeEditor = ({ isDarkMode, value, onChange, jsonResult ,isExecuting}) => {
  const editorRef = useRef();
  return (
    <div
      className={` ${
        isDarkMode ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900"
      } w-full  h-[87%] mt-24 caret-gray-50 focus:border-none rounded-xl shadow-xl p-3 text-lg font-mono`}
    >
      <Editor
        height="60%"
        theme={`${isDarkMode ? "vs-dark" : "vs-light"}`}
        defaultLanguage="python"
        defaultValue={`# your friendly neighbourhood python editor!`}
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
        }}
      />

      <Output jsonResult={jsonResult} isExecuting={isExecuting} isDarkMode={isDarkMode} />
    </div>
  );
};

export default CodeEditor;
