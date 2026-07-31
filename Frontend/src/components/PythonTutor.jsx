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
import { getHeaderFileIcon ,renderFileIcon} from "../utils/RenderFileIcon";
import { LuCopyCheck } from "react-icons/lu";
import { FaRegCircleCheck } from "react-icons/fa6";
import { IoPlayOutline } from "react-icons/io5";
import { FiDelete, FiCode, FiSave, FiPlus, FiX } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import { FaArrowUp } from "react-icons/fa6";
import markdownIcon from "../assets/icons/markdown.png";
import pythonIcon from "../assets/icons/python.png";

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
  const [attachedContext, setAttachedContext] = useState(null); // Active file code context snapshot
  const [isContextDisabled, setIsContextDisabled] = useState(false); // Manual removal flag

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

  // Automatically capture and sync context of currently active file
  useEffect(() => {
    if (!isContextDisabled) {
      if (activeFile) {
        const fileName = activeFile.name;
        const content = value !== undefined ? value : activeFile.content || "";
        if (content.trim()) {
          setAttachedContext({ fileName, content });
        } else {
          setAttachedContext(null);
        }
      } else {
        setAttachedContext(null);
      }
    }
  }, [activeFile, value, isContextDisabled]);

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
    setIsContextDisabled(false); // Auto re-enable context for newly active file
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

  // Attach or refresh active file code as context for AI chat
  const handleAttachContext = () => {
    setIsContextDisabled(false);
    const fileName = activeFile ? activeFile.name : "Active Editor";
    const content = value || "";
    if (!content.trim()) {
      setError("Active editor is empty. Write or open a file with code first!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setAttachedContext({ fileName, content });
    setError("");
  };

  // Remove attached code context manually
  const handleRemoveContext = () => {
    setIsContextDisabled(true);
    setAttachedContext(null);
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

    // Capture context snapshot for this outgoing message
    const currentContext = attachedContext ? { ...attachedContext } : null;

    const userMessage = {
      role: "user",
      content: input,
      ...(currentContext ? { context: currentContext } : {}),
    };
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
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          codeContext: currentContext,
        }),
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
                className={`hover:text-blue-400 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all border cursor-pointer ${
                  saveStatus === "unsaved"
                    ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white font-semibold"
                    : isDarkMode
                    ? "bg-gray-800 hover:bg-blue-800/40 border-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"
                }`}
              >
                <FiSave className="text-sm " />
                {/* <span>Save</span> */}
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
              {/* <span>{copyBtn || "Copy"}</span> */}
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
              {/* <span>Clear</span> */}
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
              {/* <span>{isExecuting ? "Running..." : "Run"}</span> */}
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
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-600">
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
                {msg.context && (
                  <div className="mb-2 pb-1.5 border-b border-gray-700/40 flex items-center gap-1.5 text-xs text-blue-400 font-mono">
                    <FiCode className="text-xs shrink-0 text-blue-400" />
                    <span className="truncate">Context: {msg.context.fileName}</span>
                    <span className="text-[10px] text-gray-400 font-sans">
                      ({msg.context.content?.length || 0} chars)
                    </span>
                  </div>
                )}
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

        {/* Input Controls Container (Cursor / VS Code Chat Style) */}
        <form
          onSubmit={handleSubmit}
          className={`p-3 rounded-2xl border transition-all duration-200 shadow-sm shrink-0 mt-2 flex flex-col gap-2.5 ${
            isDarkMode
              ? "bg-gray-800/80 border-gray-700/80 focus-within:border-blue-500/80 focus-within:ring-1 focus-within:ring-blue-500/30"
              : "bg-white border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400/30"
          }`}
        >
          {/* Top Section: Active Context Pill (Above prompt input) */}
          {attachedContext && (
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed text-xs font-mono transition-all ${
                  isDarkMode
                    ? "bg-gray-900/80 border-gray-600 text-gray-200"
                    : "bg-gray-100 border-gray-300 text-gray-800"
                }`}
              >
                <span className="text-gray-400 font-sans text-xs select-none font-bold">+</span>
                <span className="shrink-0">{renderFileIcon(attachedContext.fileName)}</span>
                <span className="truncate max-w-48 font-medium">
                  {attachedContext.fileName}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveContext}
                  title="Remove context"
                  className="ml-1 text-gray-400 hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer"
                >
                  <FiX className="text-xs" />
                </button>
              </div>
            </div>
          )}

          {/* Middle Section: Textarea Input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading) handleSubmit(e);
              }
            }}
            rows={2}
            placeholder={
              attachedContext
                ? `Ask Codey about ${attachedContext.fileName}...`
                : "Describe what to build or ask Codey..."
            }
            disabled={isLoading}
            className={`w-full bg-transparent text-sm outline-none resize-none px-1 placeholder-gray-500 disabled:opacity-50 min-h-10.5 max-h-32 ${
              isDarkMode ? "text-gray-100" : "text-gray-900"
            }`}
          />

          {/* Bottom Toolbar Section */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-700/20">
            {/* Left Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Plus Button to Add / Re-attach Context */}
              <button
                type="button"
                onClick={handleAttachContext}
                title={
                  attachedContext
                    ? `Context attached: ${attachedContext.fileName} (click to refresh)`
                    : `Add active file code context (${activeFile ? activeFile.name : "Editor"})`
                }
                className={`p-1.5 px-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  attachedContext
                    ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                    : isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                    : "bg-gray-100 border-gray-300 text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiPlus className="text-sm" />
                <span className="text-[11px] font-sans">Context</span>
              </button>

              {/* Agent / Model Badge */}
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-sans ${
                  isDarkMode
                    ? "bg-gray-900/50 border-gray-700/60 text-gray-300"
                    : "bg-gray-100 border-gray-200 text-gray-700"
                }`}
              >
                <RiRobot2Line className="text-blue-400 text-xs" />
                <span className="font-medium">Codey AI</span>
              </div>
            </div>

            {/* Right Action: Send Button */}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center cursor-pointer"
              title="Send message (Enter)"
            >
              <FaArrowUp />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PythonTutor;

