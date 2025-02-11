import { useState, useEffect, version } from "react";
import { Groq } from "groq-sdk/index.mjs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { systemPrompt_txt } from "../utils/System_Prompt";
import { FiSun, FiMoon } from "react-icons/fi";
import CodeEditor from "./CodeEditor";
import Header from "./Header";
import APIkeyModal from "./APIkeyModal";
import Description from "./Description";

const PythonTutor = () => {
  const [messages, setMessages] = useState([]); // Stores all messages (chat history)
  const [input, setInput] = useState(""); // Stores user input
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GROQ_API_KEY || ""); // API key
  const [isLoading, setIsLoading] = useState(false); // Tracks loading state
  const [error, setError] = useState(""); // Stores error messages
  const [showApiKeyModal, setShowApiKeyModal] = useState(false); // Controls API modal visibility
  const [textAreaValue, setTextAreaValue] = useState(""); // For input text area
  const [value, setValue] = useState(""); // Stores the value of the code editor
  const [jsonResult, setJsonResult] = useState(""); // Stores execution results
  const [isExecuting, setIsExecuting] = useState(false); // Tracks execution status
  const [copyBtn, setCopyBtn] = useState("copy"); // Controls copy button text

  // system prompt
  const systemPrompt = systemPrompt_txt;

  useEffect(() => {
    // Check localStorage first, then fallback to .env
    const savedKey = localStorage.getItem("groq-api-key");
    if (savedKey) {
      setApiKey(savedKey);
    } else if (import.meta.env.VITE_GROQ_API_KEY) {
      setApiKey(import.meta.env.VITE_GROQ_API_KEY);
    }
  }, []);

  // handle sending user message to groq and getting AI response
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !apiKey) {
      setError("Please enter a message and valid API key");
      alert("Please enter a message and valid API key");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      const userMessage = { role: "user", content: input };

      // takes previous array elements and append the userMessage at the end
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      // API code for grouq
      const stream = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          userMessage,
        ],
        temperature: 1,
        max_completion_tokens: 30000,
        stream: true,
      });

      let assistantContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        assistantContent += content;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              {
                ...last,
                content: assistantContent,
              },
            ];
          }
          return [...prev, { role: "assistant", content: assistantContent }];
        });
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const [isDarkMode, setIsDarkMode] = useState(true);

  // formating of AI message to make visually pleasing , and easy to read messages
  const parseMessageContent = (content) => {
    const parts = content.split(
      /(```python[\s\S]*?```|\*\*.*?\*\*|^#{1,3}\s.+$)/gm
    );

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.startsWith("```python")) {
        const code = part
          .replace(/```python/g, "")
          .replace(/```/g, "")
          .trim();
        return (
          <SyntaxHighlighter
            key={index}
            language="python"
            style={isDarkMode ? vscDarkPlus : vs}
            customStyle={{
              borderRadius: "0.5rem",
              margin: "1rem 0",
              padding: "1rem",
              background: isDarkMode ? "#1e1e1e" : "#f3f4f6",
            }}
          >
            {code}
          </SyntaxHighlighter>
        );
      } else if (part.startsWith("#")) {
        const level = part.match(/^#+/)[0].length;
        const headerText = part.replace(/^#+\s+/, "").trim();
        const headerClass =
          {
            1: `text-3xl font-extrabold mt-8 mb-4 ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`,
            2: `text-2xl font-bold mt-6 mb-3 ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`,
            3: `text-xl font-semibold mt-4 mb-2 ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`,
          }[level] || "";

        return (
          <div key={index} className={headerClass}>
            {headerText}
          </div>
        );
      } else if (part.startsWith("**") && part.endsWith("**")) {
        const headerText = part.slice(2, -2).trim();
        return (
          <div
            className={`text-lg font-bold mb-2 ${
              isDarkMode ? "text-purple-400" : "text-purple-600"
            }`}
          >
            {headerText}
          </div>
        );
      }

      // Process text with bold formatting and line breaks
      return part.split(/(\*\*.+?\*\*|\n)/g).map((text, textIndex) => {
        if (text.startsWith("**") && text.endsWith("**")) {
          const boldText = text.slice(2, -2).trim();
          return (
            <span
              key={`${index}-${textIndex}`}
              className="font-semibold text-yellow-400"
            >
              {boldText}
            </span>
          );
        } else if (text === "\n") {
          return <br key={`${index}-${textIndex}`} />;
        }
        return <span key={`${index}-${textIndex}`}>{text}</span>;
      });
    });
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

        {/* API Key Modal */}
        {showApiKeyModal && (
          <APIkeyModal
            apiKey={apiKey}
            setApiKey={setApiKey}
            setShowApiKeyModal={setShowApiKeyModal}
            setIsDarkMode={setIsDarkMode}
            isDarkMode={isDarkMode}
          ></APIkeyModal>
        )}

        {/* Chat Interface */}
        <div
          className={`rounded-xl p-4 mb-6 font-sans text-lg  ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } shadow-xl`}
        >
          <div className="h-96 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl max-w-[85%] ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-500/20 border border-blue-500/30"
                    : `${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`
                }`}
              >
                <div className="prose prose-invert">
                  {parseMessageContent(msg.content)}
                </div>
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
              disabled={!apiKey || isLoading}
              className={`flex-1 p-3 rounded-lg font-mono ${
                isDarkMode
                  ? "bg-gray-700 focus:ring-2 focus:ring-blue-500"
                  : "bg-gray-100 focus:ring-2 focus:ring-blue-400"
              } outline-none transition-all`}
            />
            <button
              type="submit"
              disabled={!apiKey || isLoading}
              className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              className="p-3 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg transition-colors"
            >
              🔑
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
