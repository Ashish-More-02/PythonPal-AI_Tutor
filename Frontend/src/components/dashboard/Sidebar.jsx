import { useNavigate } from "react-router-dom";
import { FiHome, FiGrid, FiBookOpen, FiBox, FiCode, FiSettings, FiSun, FiMoon, FiLogOut, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

// `view` items switch the dashboard in place; `to` items leave it.
const NAV = [
  { label: "Home", icon: FiHome, to: "/", state: { showLanding: true } },
  { label: "Dashboard", icon: FiGrid, view: "overview" },
  { label: "Lessons", icon: FiBookOpen, view: "lessons" },
  { label: "Projects", icon: FiBox, view: "projects" },
  { label: "Free Practice", icon: FiCode, to: "/app" },
];

const Sidebar = ({ isDarkMode, setIsDarkMode, view, onSelectView, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const itemClass = (isActive) =>
    `group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
      isActive
        ? "bg-emerald-500/10 text-emerald-500"
        : isDarkMode
        ? "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const NavItem = ({ item }) => {
    const isActive = item.view === view;
    const onClick = () => {
      if (item.view) onSelectView(item.view);
      else navigate(item.to, { state: item.state });
      onClose();
    };
    return (
      <button onClick={onClick} className={itemClass(isActive)}>
        <item.icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
        {item.label}
        {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      </button>
    );
  };

  return (
    <>
      {/* phone/tablet: dim the page behind the open drawer */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 flex flex-col border-r transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
      >
        <div className="h-16 shrink-0 flex items-center justify-between px-5">
          <button
            onClick={() => navigate("/", { state: { showLanding: true } })}
            className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent tracking-tight cursor-pointer"
          >
            PythonPal 🐍
          </button>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-500/20 cursor-pointer" aria-label="Close menu">
            <FiX size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className={`px-3 pb-2 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            Menu
          </p>
          {NAV.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}

          <p className={`px-3 pt-6 pb-2 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            Account
          </p>
          <NavItem item={{ label: "Settings", icon: FiSettings, view: "settings" }} />
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={itemClass(false)}>
            {isDarkMode ? <FiSun size={18} className="shrink-0" /> : <FiMoon size={18} className="shrink-0" />}
            {isDarkMode ? "Light mode" : "Dark mode"}
          </button>
        </nav>

        <div className={`p-3 border-t ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}>
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 text-white font-semibold flex items-center justify-center">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{user?.name || "Learner"}</p>
              <p className={`text-xs truncate ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
