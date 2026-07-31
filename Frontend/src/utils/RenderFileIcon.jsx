import pythonIcon from "../assets/icons/python.png";
import markdownIcon from "../assets/icons/markdown.png";
import { FiFile ,FiCode} from "react-icons/fi";

export const renderFileIcon = (fileName = "") => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (ext === "py" || ext === "python") {
    return <img src={pythonIcon} alt="Python" className="w-3 h-3 object-contain shrink-0" />;
  }
  if (ext === "md" || ext === "markdown") {
    return <img src={markdownIcon} alt="Markdown" className="w-4 h-4 object-contain shrink-0" />;
  }
  return (
    <span className="text-emerald-400 text-sm flex items-center justify-center shrink-0">
      <FiFile size={14} />
    </span>
  );
};

export const getHeaderFileIcon = (fileName) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (ext === "py" || ext === "python") {
    return <img src={pythonIcon} alt="Python" className="w-5 h-5 object-contain" />;
  }
  if (ext === "md" || ext === "markdown") {
    return <img src={markdownIcon} alt="Markdown" className="w-5 h-5 object-contain" />;
  }
  return <FiCode size={18} />;
};