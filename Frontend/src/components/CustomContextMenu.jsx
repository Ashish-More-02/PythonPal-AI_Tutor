import React, { useEffect, useRef } from "react";
import { FiEdit2, FiTrash2, FiFilePlus, FiFolderPlus } from "react-icons/fi";

function CustomContextMenu({
  x,
  y,
  node,
  onClose,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  isDarkMode = true
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!node) return null;

  const isFolder = node.type === "folder";

  // Prevent context menu from overflowing viewport bounds
  const adjustedX = Math.min(x, window.innerWidth - 180);
  const adjustedY = Math.min(y, window.innerHeight - 180);

  return (
    <div
      ref={menuRef}
      style={{
        top: `${adjustedY}px`,
        left: `${adjustedX}px`,
      }}
      className={`fixed z-50 min-w-[160px] py-1.5 rounded-xl border shadow-xl text-xs backdrop-blur-md transition-all ${
        isDarkMode
          ? "bg-gray-900/95 border-gray-700/80 text-gray-200 shadow-black/50"
          : "bg-white/95 border-gray-200 text-gray-800 shadow-gray-300/60"
      }`}
    >
      <div className="px-3 py-1 font-semibold text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-700/20 mb-1 truncate max-w-[180px]">
        {node.name}
      </div>

      {isFolder && (
        <>
          <button
            onClick={() => {
              onCreateFile(node._id);
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 transition-colors cursor-pointer ${
              isDarkMode ? "hover:bg-gray-800 text-gray-200" : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FiFilePlus size={14} className="text-emerald-400" />
            <span>New File</span>
          </button>

          <button
            onClick={() => {
              onCreateFolder(node._id);
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 transition-colors cursor-pointer ${
              isDarkMode ? "hover:bg-gray-800 text-gray-200" : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FiFolderPlus size={14} className="text-amber-400" />
            <span>New Folder</span>
          </button>

          <div className="my-1 border-t border-gray-700/20" />
        </>
      )}

      <button
        onClick={() => {
          onRename(node);
          onClose();
        }}
        className={`w-full flex items-center gap-2 px-3 py-1.5 transition-colors cursor-pointer ${
          isDarkMode ? "hover:bg-gray-800 text-gray-200" : "hover:bg-gray-100 text-gray-700"
        }`}
      >
        <FiEdit2 size={14} className="text-blue-400" />
        <span>Rename</span>
      </button>

      <button
        onClick={(e) => {
          onDelete(node._id, e);
          onClose();
        }}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ${
          isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
        }`}
      >
        <FiTrash2 size={14} />
        <span>Delete</span>
      </button>
    </div>
  );
}

export default CustomContextMenu;
