import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CodeEditor from "./CodeEditor";
import FileTree from "./FileTree";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";
import { ideApi } from "../API/ideAPI";
import { buildFileTree } from "../utils/treeBuilder";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { LuCopyCheck } from "react-icons/lu";
import { FaRegCircleCheck } from "react-icons/fa6";
import { IoPlayOutline } from "react-icons/io5";
import { FiDelete, FiCode, FiSave } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import pythonIcon from "../assets/icons/python.png";
import markdownIcon from "../assets/icons/markdown.png";
import { getHeaderFileIcon } from "../utils/RenderFileIcon";


// Streamdown's plugin set is identity-compared, so it must be a stable module
// constant rather than an inline object.
const streamdownPlugins = { code };

// Our own backend now holds the Groq key and the system prompt.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PythonTutor = () => {
  const { isDarkMode } = useDarkMode();
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
  const [copyBtn, setCopyBtn] = useState(""); // Controls copy button text

  // File tree / Workspace states
  const [rawNodes, setRawNodes] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // '', 'saving', 'saved', 'unsaved', 'error'

  // Re-build tree dynamically whenever rawNodes state updates
  const treeNodes = useMemo(() => buildFileTree(rawNodes), [rawNodes]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load workspace structure from backend => this function uses flat array only , to show contents of first file.
  const loadWorkspace = async () => {
    if (!token) return;
    setIsWorkspaceLoading(true);
    try {
      const nodes = await ideApi.fetchWorkspace(token);
      setRawNodes(nodes || []);

      // Auto-select first file if none selected
      if (!activeFile && nodes && nodes.length > 0) {
        const firstFile = nodes.find((n) => n.type === "file");
        if (firstFile) {
          setActiveFile(firstFile);
          setValue(firstFile.content || "");
        }
      }
    } catch (err) {
      console.error("Failed to load workspace:", err);
    } finally {
      setIsWorkspaceLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [token]);

  // Handle selecting a file from tree
  const handleSelectFile = async (fileNode) => {
    if (!fileNode || fileNode.type !== "file") return;
    if (activeFile && activeFile._id === fileNode._id) return;

    // Auto-save unsaved changes on current file before switching
    if (activeFile && value !== activeFile.content) {
      try {
        const currentFileId = activeFile._id;
        const currentVal = value;
        await ideApi.saveFile(currentFileId, currentVal, token);
        setRawNodes((prev) =>
          prev.map((n) => (n._id === currentFileId ? { ...n, content: currentVal } : n))
        );
      } catch (err) {
        console.error("Auto-save on file switch failed:", err);
      }
    }

    // Lookup latest node state from rawNodes
    const targetNode = rawNodes.find((n) => n._id === fileNode._id) || fileNode;
    setActiveFile(targetNode);
    setValue(targetNode.content || "");
    setSaveStatus("");
  };

  // Handle selecting target parent folder
  const handleSelectParent = (folderId) => {
    setSelectedParentId((prev) => (prev === folderId ? null : folderId));
  };

  // Handle creating a new file/folder
  const handleCreateNode = async ({ name, type, parentId }) => {
    if (!token) return;

    try {
      // Calculate normalized path
      let path = `/${name}`;
      if (parentId) {
        const parentNode = rawNodes.find((n) => n._id === parentId);
        if (parentNode) {
          path = `${parentNode.path}/${name}`.replace(/\/+/g, "/");
        }
      }

      const newNode = await ideApi.createNode(
        { name, path, type, parentId },
        token
      );

      setRawNodes((prev) => [...prev, newNode]);

      // If created node is a file, select it
      if (type === "file") {
        setActiveFile(newNode);
        setValue(newNode.content || "");
        setSaveStatus("");
      }
    } catch (err) {
      alert(err.message || "Failed to create item");
    }
  };

  // Handle deleting a file/folder
  const handleDeleteNode = async (nodeId) => {
    if (!token) return;

    try {
      await ideApi.deleteNode(nodeId, token);

      setRawNodes((prev) =>
        prev.filter((n) => n._id !== nodeId && n.parentId !== nodeId)
      );

      // If active file was deleted
      if (activeFile?._id === nodeId) {
        const remainingFile = rawNodes.find((n) => n.type === "file" && n._id !== nodeId);
        if (remainingFile) {
          setActiveFile(remainingFile);
          setValue(remainingFile.content || "");
        } else {
          setActiveFile(null);
          setValue("");
        }
        setSaveStatus("");
      }
    } catch (err) {
      alert(err.message || "Failed to delete item");
    }
  };

  // Handle renaming a file/folder
  const handleRenameNode = async (nodeId, newName) => {
    if (!token || !newName.trim()) return;

    const targetNode = rawNodes.find((n) => n._id === nodeId);
    if (!targetNode || targetNode.name === newName) return;

    try {
      let newPath = `/${newName}`;
      if (targetNode.parentId) {
        const parentNode = rawNodes.find((n) => n._id === targetNode.parentId);
        if (parentNode) {
          newPath = `${parentNode.path}/${newName}`.replace(/\/+/g, "/");
        }
      }

      await ideApi.moveNode(nodeId, { name: newName, newPath }, token);

      // Refresh workspace after renaming
      await loadWorkspace();
    } catch (err) {
      alert(err.message || "Failed to rename item");
    }
  };

  // Save active file content to backend
  const handleSaveFile = async () => {
    if (!activeFile || !token) return;

    setSaveStatus("saving");
    try {
      await ideApi.saveFile(activeFile._id, value, token);
      setSaveStatus("saved");

      // Update activeFile object in state
      setActiveFile((prev) => (prev ? { ...prev, content: value } : null));

      // Update in local rawNodes
      setRawNodes((prev) =>
        prev.map((n) => (n._id === activeFile._id ? { ...n, content: value } : n))
      );

      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      setSaveStatus("error");
      console.error("Failed to save file:", err);
    }
  };

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
    const history = [...messages, userMessage];

    setMessages(history);
    setInput("");

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: history }),
      });

      if (response.status === 401) {
        logout();
        navigate("/signin");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;

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

  return (
    <div className="h-full w-full flex flex-col lg:flex-row gap-4 p-4 overflow-hidden min-h-0">

      {/* Leftmost panel: File structure */}
      <div
        className={`w-full lg:w-60 shrink-0 flex flex-col min-w-0 h-full overflow-hidden rounded-2xl border p-4 shadow-sm transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-900/70 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        <FileTree
          isDarkMode={isDarkMode}
          tree={treeNodes}
          rawNodes={rawNodes}
          activeFileId={activeFile?._id}
          selectedParentId={selectedParentId}
          onSelectFile={handleSelectFile}
          onSelectParent={handleSelectParent}
          onCreateNode={handleCreateNode}
          onDeleteNode={handleDeleteNode}
          onRenameNode={handleRenameNode}
          onRefresh={loadWorkspace}
          isLoading={isWorkspaceLoading}
        />
      </div>

      {/* Left Panel: Code Editor & Terminal Output */}
      <div
        className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden rounded-2xl border p-4 shadow-sm transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-900/70 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Editor Toolbar Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-700/20 shrink-0 mb-3">
          {/* python workspace / active file */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              {activeFile ? getHeaderFileIcon(activeFile.name) : <FiCode size={18} />}
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-semibold text-sm tracking-wide truncate">
                {activeFile ? activeFile.name : "Python Workspace"}
              </h2>
              {saveStatus === "unsaved" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                  Unsaved
                </span>
              )}
              {saveStatus === "saving" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium animate-pulse">
                  Saving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                  Saved
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Save Button */}
            {activeFile && (
              <button
                onClick={handleSaveFile}
                disabled={saveStatus === "saving"}
                title="Save File to Database"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all border cursor-pointer ${
                  saveStatus === "unsaved"
                    ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white font-semibold"
                    : isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"
                }`}
              >
                <FiSave className="text-sm" />
                <span>Save</span>
              </button>
            )}

            {/* Copy Button */}
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(value);
                setCopyBtn("Copied!");
                setTimeout(() => setCopyBtn(""), 2000);
              }}
              title="Copy Code"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all border cursor-pointer ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"
              }`}
            >
              {copyBtn ? (
                <FaRegCircleCheck className="text-emerald-400 text-sm" />
              ) : (
                <LuCopyCheck className="text-sm" />
              )}
              <span>{copyBtn || "Copy"}</span>
            </button>

            {/* Clear Button */}
            <button
              onClick={() => {
                setTextAreaValue("");
                setValue("");
                setSaveStatus("unsaved");
              }}
              title="Clear Editor"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all border cursor-pointer ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-red-950/40 hover:text-red-400 border-gray-700 text-gray-300"
                  : "bg-gray-100 hover:bg-red-50 hover:text-red-600 border-gray-200 text-gray-700"
              }`}
            >
              <FiDelete className="text-sm" />
              <span>Clear</span>
            </button>

            {/* Run Button */}
            <button
              onClick={() => {
                if (activeFile) handleSaveFile();
                handleRunCode();
              }}
              disabled={isExecuting}
              title="Run Python Code"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <IoPlayOutline className="text-sm font-bold" />
              <span>{isExecuting ? "Running..." : "Run"}</span>
            </button>
          </div>
        </div>

        {/* Monaco Code Editor & Terminal Output */}
        <CodeEditor
          isDarkMode={isDarkMode}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            setSaveStatus("unsaved");
          }}
          jsonResult={jsonResult}
          isExecuting={isExecuting}
        />
      </div>

      {/* Right Panel: AI Assistant Chat */}
      <div
        className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden rounded-2xl border p-4 shadow-sm transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-900/70 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-700/20 shrink-0 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-base">
              <RiRobot2Line />
            </span>
            <div>
              <h2 className="font-semibold text-sm">Codey AI Assistant</h2>
              <p className="text-[11px] text-gray-400">
                Personal Python tutor & debug helper
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Ready
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-3">
              <div className="text-4xl p-3 rounded-2xl bg-blue-500/10">🐍</div>
              <h3 className="font-semibold text-lg text-gray-200">
                Welcome to PythonPal AI!
              </h3>
              <p className="text-sm max-w-md">
                Ask me to explain concepts, debug code, or walk through Python challenges.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md pt-2">
                {[
                  "Explain Python lists vs tuples",
                  "How to write a for loop?",
                  "Help me debug my code",
                  "Show an example of a function",
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(suggestion)}
                    className={`p-2.5 text-xs text-left rounded-xl border transition-all cursor-pointer ${
                      isDarkMode
                        ? "bg-gray-800/60 border-gray-700 hover:bg-gray-700 text-gray-300"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    💡 {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "ml-auto bg-[#232323ca] text-white rounded-br-none shadow-sm border border-[#323232]"
                    : `${
                        isDarkMode
                          ? "bg-gray-800/90 text-gray-100 border border-gray-700/50"
                          : "bg-gray-100 text-gray-900 border border-gray-200"
                      } rounded-bl-none`
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
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-400 p-2">
              <div className="animate-pulse text-base">🤖</div>
              <span>Codey is thinking...</span>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs">
              {error}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Controls */}
        <form
          onSubmit={handleSubmit}
          className="pt-3 border-t border-gray-700/20 flex gap-2 shrink-0 mt-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Codey about Python..."
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500/50"
                : "bg-gray-100 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-400"
            } outline-none border transition-all disabled:opacity-50`}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PythonTutor;

