import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CodeEditor from "./CodeEditor";
import Header from "./Header";
import Description from "./Description";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

// Streamdown's plugin set is identity-compared, so it must be a stable module
// constant rather than an inline object.
const streamdownPlugins = { code };

// Our own backend now holds the Groq key and the system prompt.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PythonTutor = () => {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]); // Stores all messages (chat history)
  const [input, setInput] = useState(""); // Stores user input
  const [isLoading, setIsLoading] = useState(false); // Tracks loading state
  const [error, setError] = useState(""); // Stores error messages
  const [textAreaValue, setTextAreaValue] = useState(""); // For input text area
  const [value, setValue] = useState(""); // Stores the value of the code editor
  const [jsonResult, setJsonResult] = useState(""); // Stores execution results
  const [isExecuting, setIsExecuting] = useState(false); // Tracks execution status
  const [copyBtn, setCopyBtn] = useState("copy"); // Controls copy button text

  // handle sending user message to our backend and getting the AI response
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setError("Please enter a message");
      return;
    }

    setIsLoading(true);
    setError("");

    const userMessage = { role: "user", content: input };
    // The backend is stateless, so we send the whole conversation every time.
    // `messages` state updates asynchronously, so build the history explicitly.
    const history = [...messages, userMessage];

    setMessages(history);
    setInput("");

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Every protected request carries the JWT; the backend middleware verifies it.
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: history }),
      });

      // Token missing/expired/tampered → log out and send them back to login.
      if (response.status === 401) {
        logout();
        navigate("/signin");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      // Add an empty assistant bubble now, then keep rewriting it as text arrives.
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader(); // contains raw bytes of data.
      const decoder = new TextDecoder(); // converts the raw bytes into readable text.
      let assistantContent = "";

      while (true) {
        // Named `chunk`, not `value`, so it doesn't shadow the code-editor state.
        const { done, value: chunk } = await reader.read();
        if (done) break;

        // `stream: true` lets the decoder hold back a half-received emoji or
        // accented character until its remaining bytes turn up in the next chunk.
        assistantContent += decoder.decode(chunk, { stream: true });
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: assistantContent },
        ]);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // runs the code in code Editor and gets the response
  async function handleRunCode() {
    const sourceCode = value;
    if (!sourceCode) return;

    setJsonResult(null);
    setIsExecuting(true);

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "python",
          version: "3.10.0",
          files: [{ content: sourceCode }],
        }),
      });

      if (!response.ok) throw new Error("Execution failed");
      const result = await response.json();
      setJsonResult(result);
    } catch (error) {
      setJsonResult({
        message: error.message,
        run: { stderr: "Failed to execute code" },
      });
    } finally {
      setIsExecuting(false);
    }
  }

  // UI logic
  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex w-full ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-4xl min-w-[60%] mx-auto px-4 py-8">
        {/* Header */}
        <Header setIsDarkMode={setIsDarkMode} isDarkMode={isDarkMode}></Header>

        {/* Chat Interface */}
        <div
          className={`rounded-xl p-4 mb-6 font-sans text-lg h-[83vh] ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } shadow-xl`}
        >
          <div className="h-[90%] overflow-y-auto space-y-4 mb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl max-w-[85%] ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-500/20 border border-blue-500/30"
                    : `${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`
                }`}
              >
                <Streamdown
                  plugins={streamdownPlugins}
                  animated
                  isAnimating={
                    isLoading &&
                    msg.role === "assistant" &&
                    i === messages.length - 1
                  }
                >
                  {msg.content}
                </Streamdown>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="animate-pulse">🤖</div>
                <span>Codey is thinking...</span>
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-500/20 text-red-300 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex gap-2 ">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Codey about Python..."
              disabled={isLoading}
              className={`flex-1 p-3 rounded-lg font-mono ${
                isDarkMode
                  ? "bg-gray-700 focus:ring-2 focus:ring-blue-500"
                  : "bg-gray-100 focus:ring-2 focus:ring-blue-400"
              } outline-none transition-all`}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>

        {/* Description Section */}
        <Description
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        ></Description>
      </div>
      <div className="sm:block hidden w-[40%] mx-4">
        {/* buttons */}
        <div
          className={` text-white buttons flex justify-end align-bottom absolute top-10 right-6`}
        >
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(value);
              setCopyBtn("✅ copied");
              setTimeout(() => {
                setCopyBtn("copy");
              }, 2000);
            }}
            className=" mx-2 bg-gray-700 py-2 px-6 rounded-lg text-inherit"
          >
            {copyBtn}
          </button>
          <button
            onClick={handleRunCode}
            className=" mx-2 bg-green-600 py-2 px-6 rounded-lg text-inherit"
          >
            Run
          </button>{" "}
          <button
            onClick={() => {
              setTextAreaValue("");
              setValue("");
            }}
            className=" mx-2 bg-orange-700 py-2 px-6 rounded-lg text-inherit"
          >
            Clear
          </button>
        </div>

        {/* <textarea
          className={` ${
            isDarkMode ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900"
          } w-full h-[87%] mt-24 caret-gray-50 focus:border-none rounded-xl shadow-xl p-4 text-lg font-mono`}
          name="playground"
          id=""
          placeholder="write code for practise here"
          onChange={(e) => {
            setTextAreaValue(e.target.value);
          }}
          value={textAreaValue}
        ></textarea> */}

        <CodeEditor
          isDarkMode={isDarkMode}
          value={value}
          onChange={(newValue) => setValue(newValue)}
          jsonResult={jsonResult}
          isExecuting={isExecuting}
        ></CodeEditor>
      </div>
    </div>
  );
};

export default PythonTutor;
