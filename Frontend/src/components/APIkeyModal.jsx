import React from "react";

const APIkeyModal = ({
  apiKey,
  setApiKey,
  setShowApiKeyModal,
  setIsDarkMode,
  isDarkMode,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
      <div
        className={`p-6 rounded-xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } w-96`}
      >
        <h3 className="text-xl font-semibold mb-4">🔑 API Key Setup</h3>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Groq API key"
          className={`w-full p-3 rounded-lg mb-4 ${
            isDarkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              localStorage.setItem("groq-api-key", apiKey);
              setShowApiKeyModal(false);
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => setShowApiKeyModal(false)}
            className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 px-4 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
        <div className="pt-5 bg-inherit ">
          <div>
            Enter your groq API here{" "}
            <a
              href="https://groq.com/"
              className="text-blue-400 hover:underline"
              target="blank"
            >
              Offical Groq website
            </a>
          </div>
          <p className="text-gray-300 text-sm">
            Groq cloud provides free open source LLM models in the form of API.
          </p>
        </div>
      </div>
    </div>
  );
};

export default APIkeyModal;
