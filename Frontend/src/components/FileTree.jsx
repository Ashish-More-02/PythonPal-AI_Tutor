import React, { useState } from "react";
import {
  FiFolder,
  FiFile,
  FiFilePlus,
  FiFolderPlus,
  FiChevronRight,
  FiChevronDown,
  FiTrash2,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiEdit2
} from "react-icons/fi";
import { LuFolderOpen } from "react-icons/lu";
import {renderFileIcon} from "../utils/RenderFileIcon";
import CustomContextMenu from "./CustomContextMenu";


const FileTree = ({
  isDarkMode,
  tree = [],
  rawNodes = [],
  activeFileId,
  selectedParentId,
  onSelectFile,
  onSelectParent,
  onCreateNode,
  onDeleteNode,
  onRenameNode,
  onRefresh,
  isLoading
}) => {
  // State for expanded folders
  const [expandedFolders, setExpandedFolders] = useState({}); // empty object
  // State for creating a new node: { type: 'file' | 'folder', parentId: string | null }
  const [createPrompt, setCreatePrompt] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // State for context menu and inline renaming
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, node: null });
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Handle right click on file or folder node
  const handleNodeContextMenu = (e, node) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node
    });
  };

  // Start inline rename flow
  const handleStartRename = (node) => {
    setEditingNodeId(node._id);
    setEditingName(node.name);
  };

  // Submit inline rename
  const handleConfirmRename = async (e) => {
    e?.preventDefault();
    if (!editingName.trim() || !editingNodeId) return;
    const targetNode = rawNodes.find((n) => n._id === editingNodeId);
    if (targetNode && targetNode.name !== editingName.trim()) {
      if (onRenameNode) {
        await onRenameNode(editingNodeId, editingName.trim());
      }
    }
    setEditingNodeId(null);
    setEditingName("");
  };

  // Cancel inline rename
  const handleCancelRename = () => {
    setEditingNodeId(null);
    setEditingName("");
  };

  // Toggle folder open/closed
  const toggleFolder = (folderId, e) => {
    if (e) e.stopPropagation(); // because of this child folders will not open

    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
    // Also select this folder as current parent target
    onSelectParent(folderId);
  };

  // Find node by ID in rawNodes
  const selectedParentNode = rawNodes.find((n) => n._id === selectedParentId);

  // Start creation flow
  const handleStartCreate = (type, parentId = selectedParentId) => {
    setCreatePrompt({ type, parentId });
    setNewItemName("");
    if (parentId) {
      setExpandedFolders((prev) => ({ ...prev, [parentId]: true }));
    }
  };

  // Submit creation : file or folder.
  const handleConfirmCreate = async (e) => {
    e?.preventDefault();
    if (!newItemName.trim() || !createPrompt) return;

    const name = newItemName.trim();
    const { type, parentId } = createPrompt;

    await onCreateNode({ name, type, parentId });
    setCreatePrompt(null);
    setNewItemName("");
  };

  // Cancel creation
  const handleCancelCreate = () => {
    setCreatePrompt(null);
    setNewItemName("");
  };

  // Delete node
  const handleDelete = async (nodeId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this item?")) {
      setDeletingId(nodeId);
      try {
        await onDeleteNode(nodeId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Another component here : Helper to render tree recursively
  const renderTreeNodes = (nodes, depth = 0) => {
    if (!nodes || nodes.length === 0) return null;

    return nodes.map((node) => {
      const isFolder = node.type === "folder";
      const isExpanded = !!expandedFolders[node._id];
      const isActiveFile = activeFileId === node._id;
      const isSelectedFolder = selectedParentId === node._id;
      const isEditing = editingNodeId === node._id;

      return (
        <div key={node._id} className="select-none">
          {/* Item Row */}
          <div
            onClick={(e) => {
              if (isEditing) return;
              if (isFolder) {
                toggleFolder(node._id, e);
              } else {
                onSelectFile(node);
              }
            }}
            onContextMenu={(e) => handleNodeContextMenu(e, node)}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            className={`group flex items-center justify-between py-1 px-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              isActiveFile
                ? isDarkMode
                  ? "bg-slate-500/20 text-emerald-300 font-semibold border border-slate-500/30"
                  : "bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300"
                : isSelectedFolder
                ? isDarkMode
                  ? "bg-gray-800/30 text-blue-400"
                  : "bg-blue-50/30 text-blue-700"
                : isDarkMode
                ? "text-gray-300 hover:bg-gray-800/60"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {isEditing ? (
              <form
                onSubmit={handleConfirmRename}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 flex-1 py-0.5"
              >
                <span className="text-xs flex items-center justify-center">
                  {isFolder ? (
                    <FiFolder size={13} className="text-amber-400" />
                  ) : (
                    renderFileIcon(editingName)
                  )}
                </span>
                <input
                  type="text"
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") handleCancelRename();
                  }}
                  className={`flex-1 min-w-0 px-2 py-0.5 text-xs rounded border outline-none ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
                <button
                  type="submit"
                  className="p-1 text-emerald-400 hover:text-emerald-300"
                  title="Confirm"
                >
                  <FiCheck size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleCancelRename}
                  className="p-1 text-red-400 hover:text-red-300"
                  title="Cancel"
                >
                  <FiX size={13} />
                </button>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-1.5 min-w-0 flex-1 py-0.5">
                  {isFolder ? (
                    <>
                      <span className="text-gray-400 hover:text-gray-200">
                        {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                      </span>
                      <span className="text-amber-400 text-sm">
                        {isExpanded ? <LuFolderOpen size={15} /> : <FiFolder size={15} />}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-3.5"></span>
                      {renderFileIcon(node.name)}
                    </>
                  )}
                  <span className="truncate">{node.name}</span>
                </div>

                {/* Quick Actions on Hover */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  {isFolder && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartCreate("file", node._id);
                        }}
                        title="New File inside"
                        className="p-1 hover:bg-gray-700/50 rounded text-gray-300 hover:text-emerald-400"
                      >
                        <FiFilePlus size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartCreate("folder", node._id);
                        }}
                        title="New Folder inside"
                        className="p-1 hover:bg-gray-700/50 rounded text-gray-300 hover:text-amber-400"
                      >
                        <FiFolderPlus size={13} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartRename(node);
                    }}
                    title="Rename"
                    className="p-1 hover:bg-gray-700/50 rounded text-gray-300 hover:text-blue-400"
                  >
                    <FiEdit2 size={13} />
                  </button>
                  <button
                    disabled={deletingId === node._id}
                    onClick={(e) => handleDelete(node._id, e)}
                    title="Delete"
                    className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Expanded folder contents with vertical guide line */}
          {isFolder && isExpanded && (
            <div className="relative">
              {/* Vertical folder span guide line */}
              <div
                className={`absolute top-0 bottom-1 w-px pointer-events-none transition-colors ${
                  isDarkMode ? "bg-gray-700/50" : "bg-gray-300/80"
                }`}
                style={{ left: `${depth * 12 + 15}px` }}
              />

              {/* Inline Input when creating child inside this folder */}
              {createPrompt?.parentId === node._id && (
                <div
                  style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
                  className="py-1 px-2 my-0.5"
                >
                  <form onSubmit={handleConfirmCreate} className="flex items-center gap-1">
                    <span className="text-xs flex items-center justify-center">
                      {createPrompt.type === "folder" ? (
                        <FiFolder size={13} className="text-amber-400" />
                      ) : (
                        renderFileIcon(newItemName)
                      )}
                    </span>
                    <input
                      type="text"
                      autoFocus
                      placeholder={`New ${createPrompt.type}...`}
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") handleCancelCreate();
                      }}
                      className={`flex-1 min-w-0 px-2 py-0.5 text-xs rounded border outline-none ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      }`}
                    />
                    <button
                      type="submit"
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                      title="Confirm"
                    >
                      <FiCheck size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelCreate}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Cancel"
                    >
                      <FiX size={13} />
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-tree */}
              {node.children && renderTreeNodes(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full w-full select-none">
      {/* Explorer Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-700/20 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400">
            Explorer
          </h3>
        </div>

        {/* Root action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleStartCreate("file", selectedParentId)}
            title={
              selectedParentNode
                ? `New File inside '${selectedParentNode.name}'`
                : "New File at Root"
            }
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 border-gray-700 text-emerald-400"
                : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-emerald-600"
            }`}
          >
            <FiFilePlus size={15} />
          </button>

          <button
            onClick={() => handleStartCreate("folder", selectedParentId)}
            title={
              selectedParentNode
                ? `New Folder inside '${selectedParentNode.name}'`
                : "New Folder at Root"
            }
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 border-gray-700 text-amber-400"
                : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-amber-600"
            }`}
          >
            <FiFolderPlus size={15} />
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Workspace"
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isLoading ? "animate-spin text-gray-500" : ""
            } ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-600"
            }`}
          >
            <FiRefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Selected Target Folder Indicator */}
      <div className={"flex items-center justify-between text-[11px] px-2 py-1 mb-2 rounded bg-gray-800/30 border border-gray-800 "+`${isDarkMode? "text-gray-400":"text-black"}`}>
        <span className="truncate">
          Location:{" "}
          <span className={`${isDarkMode? "text-gray-300 ":"text-black "}`+"font-mono"}>
            {selectedParentNode ? `/${selectedParentNode.name}` : "/ (root)"}
          </span>
        </span>
        {selectedParentId && (
          <button
            onClick={() => onSelectParent(null)}
            className="text-[10px] text-blue-400 hover:underline shrink-0 ml-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Root level creation input */}
      {createPrompt?.parentId === null && (
        <div className="py-1 px-2 my-1 border border-emerald-500/30 rounded bg-emerald-500/5">
          <form onSubmit={handleConfirmCreate} className="flex items-center gap-1">
            <span className="text-xs flex items-center justify-center">
              {createPrompt.type === "folder" ? (
                <FiFolder size={13} className="text-amber-400" />
              ) : (
                renderFileIcon(newItemName)
              )}
            </span>
            <input
              type="text"
              autoFocus
              placeholder={`New ${createPrompt.type} at root...`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") handleCancelCreate();
              }}
              className={`flex-1 min-w-0 px-2 py-0.5 text-xs rounded border outline-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
            <button
              type="submit"
              className="p-1 text-emerald-400 hover:text-emerald-300"
              title="Confirm"
            >
              <FiCheck size={13} />
            </button>
            <button
              type="button"
              onClick={handleCancelCreate}
              className="p-1 text-red-400 hover:text-red-300"
              title="Cancel"
            >
              <FiX size={13} />
            </button>
          </form>
        </div>
      )}

      {/* Tree Content list */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
        {isLoading && tree.length === 0 ? (
          <div className="text-xs text-gray-400 p-3 text-center animate-pulse">
            Loading files...
          </div>
        ) : tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center text-gray-400 gap-2">
            <p className="text-xs">Workspace is empty.</p>
            <button
              onClick={() => onCreateNode({ name: "main.py", type: "file", parentId: null })}
              className="px-2.5 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-all"
            >
              + Create main.py
            </button>
          </div>
        ) : (
          renderTreeNodes(tree)
        )}
      </div>

      {/* Custom Right-Click Context Menu */}
      {contextMenu.visible && (
        <CustomContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node}
          isDarkMode={isDarkMode}
          onClose={() => setContextMenu({ visible: false, x: 0, y: 0, node: null })}
          onRename={handleStartRename}
          onDelete={(nodeId, e) => handleDelete(nodeId, e)}
          onCreateFile={(folderId) => handleStartCreate("file", folderId)}
          onCreateFolder={(folderId) => handleStartCreate("folder", folderId)}
        />
      )}
    </div>
  );
};

export default FileTree;
