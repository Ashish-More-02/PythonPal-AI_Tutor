// strucuture of this dashboard component
// it have smaller components or functions to show individual/single elements like lesson ,project and stat etc
// Then it have Render functions to show the collection of large sections or components, like overview, lessons , projects, settings

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiCode,
  FiPlay,
  FiCheck,
  FiCheckCircle,
  FiMenu,
  FiBookOpen,
  FiBox,
  FiTarget,
  FiTrendingUp,
  FiArrowRight,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import Sidebar from "../components/dashboard/Sidebar";
import StreakCalendar from "../components/dashboard/StreakCalendar";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";
import { learnApi } from "../API/learnAPI";
import ServerStatusPill from "../components/ServerStatusPill";

const isDone = (item) => item.completedSteps >= item.totalSteps;

const VIEWS = {
  overview: { title: "Dashboard", subtitle: "Your learning at a glance" },
  lessons: { title: "Lessons", subtitle: "Python Basics, one idea at a time" },
  projects: { title: "Projects", subtitle: "Build real programs step by step" },
  settings: { title: "Settings", subtitle: "Your account and preferences" },
};

// Home after login. The sidebar switches between views via ?view=, so each
// one is linkable and the back button works without separate routes.
const Dashboard = () => {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = VIEWS[searchParams.get("view")]
    ? searchParams.get("view")
    : "overview";

  const [lessons, setLessons] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    learnApi
      .fetchCurriculum(token)
      .then((data) => {
        setLessons(data.lessons);
        setProjects(data.projects);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  const selectView = (next) =>
    setSearchParams(next === "overview" ? {} : { view: next });

  const lessonsDone = lessons.filter(isDone).length;
  const projectsDone = projects.filter(isDone).length;
  const nextLessonIndex = lessons.findIndex((l) => !isDone(l));
  const allItems = [...lessons, ...projects];
  const stepsDone = allItems.reduce(
    (sum, item) => sum + item.completedSteps,
    0,
  );
  const stepsTotal = allItems.reduce((sum, item) => sum + item.totalSteps, 0);
  const overallPercent = stepsTotal
    ? Math.round((stepsDone / stepsTotal) * 100)
    : 0;

  // Top card: the unfinished thing they opened last; for a brand-new learner,
  // the first lesson they haven't finished.
  const lastOpened = [
    // Lesson 0 is the "Why Python?" intro, so the index is the lesson number.
    ...lessons.map((l, i) => ({ ...l, label: `Lesson ${i}` })),
    ...projects.map((p) => ({ ...p, label: "Project" })),
  ]
    .filter((item) => item.started && !isDone(item))
    .sort((a, b) => new Date(b.lastOpenedAt) - new Date(a.lastOpenedAt))[0];
  const nextLesson =
    nextLessonIndex !== -1
      ? { ...lessons[nextLessonIndex], label: `Lesson ${nextLessonIndex}` }
      : null;
  const topItem = lastOpened || nextLesson;

  const cardClass = `rounded-2xl border p-5 shadow-sm transition-colors duration-300 ${
    isDarkMode ? "bg-gray-900/70 border-gray-800" : "bg-white border-gray-200"
  }`;
  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-600";
  const secondaryButton = `px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer border shrink-0 transition-all active:scale-95 ${
    isDarkMode
      ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
      : "bg-gray-100 hover:bg-gray-200 border-gray-200"
  }`;
  const linkButton =
    "group inline-flex items-center gap-1 text-sm font-semibold text-emerald-500 hover:text-emerald-400 cursor-pointer";
  const buttonLabel = (item) =>
    isDone(item) ? "Review" : item.started ? "Continue" : "Start";

  const ProgressBar = ({ percent }) => (
    <div
      className={`h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-gray-200"}`}
    >
      <div
        className="h-full bg-emerald-500 transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );

  const LessonRow = ({ lesson, i }) => (
    <div className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-gray-500/5">
      <span
        className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold border ${
          isDone(lesson)
            ? "bg-emerald-600 border-emerald-500 text-white"
            : i === nextLessonIndex
              ? "border-emerald-500 text-emerald-400"
              : isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-300"
                : "bg-gray-100 border-gray-200 text-gray-700"
        }`}
      >
        {isDone(lesson) ? <FiCheck /> : i}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{lesson.title}</p>
        <p className={`text-xs truncate ${mutedText}`}>{lesson.description}</p>
      </div>
      <span className={`text-xs hidden sm:inline shrink-0 ${mutedText}`}>
        {lesson.format === "slides"
          ? "Read"
          : `${lesson.completedSteps}/${lesson.totalSteps}`}
      </span>
      <button
        onClick={() => navigate(`/learn/${lesson.id}`)}
        className={secondaryButton}
      >
        {buttonLabel(lesson)}
      </button>
    </div>
  );

  const ProjectCard = ({ project }) => (
    <div
      className={`${cardClass} flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:border-emerald-500/40`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <FiBox size={18} />
          </span>
          <h4 className="font-semibold">{project.title}</h4>
        </div>
        {isDone(project) && (
          <FiCheckCircle className="text-emerald-400 shrink-0 mt-1" />
        )}
      </div>
      <p className={`text-sm flex-1 ${mutedText}`}>{project.description}</p>
      <div>
        <ProgressBar
          percent={(project.completedSteps / project.totalSteps) * 100}
        />
        <p className={`text-xs mt-1.5 ${mutedText}`}>
          {project.completedSteps} / {project.totalSteps} steps done
        </p>
      </div>
      <button
        onClick={() => navigate(`/learn/${project.id}`)}
        className={`${secondaryButton} self-start`}
      >
        {buttonLabel(project)}
      </button>
    </div>
  );

  const FreePracticeCard = () => (
    <div
      className={`${cardClass} relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />
      <div className="relative flex items-center gap-3">
        <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
          <FiCode size={20} />
        </span>
        <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
          <RiRobot2Line size={20} />
        </span>
        <div>
          <p className="font-semibold">Free Practice</p>
          <p className={`text-sm ${mutedText}`}>
            Editor, your files, and Codey — no lesson needed.
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate("/app")}
        className="relative px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold cursor-pointer transition-all active:scale-95"
      >
        Open Free Practice
      </button>
    </div>
  );

  const stats = [
    {
      label: "Lessons done",
      value: `${lessonsDone}/${lessons.length}`,
      icon: FiBookOpen,
      tint: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Projects done",
      value: `${projectsDone}/${projects.length}`,
      icon: FiBox,
      tint: "text-blue-400 bg-blue-500/10",
    },
    {
      label: "Steps completed",
      value: stepsDone,
      icon: FiTarget,
      tint: "text-purple-400 bg-purple-500/10",
    },
    {
      label: "Overall progress",
      value: `${overallPercent}%`,
      icon: FiTrendingUp,
      tint: "text-amber-400 bg-amber-500/10",
    },
  ];

  // ---- RENDER FUNCTIONS TO DISPLAY THE ITEMS ----
  // green color overview in dashboard
  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={cardClass}>
            <span className={`inline-flex p-2 rounded-xl ${s.tint}`}>
              <s.icon size={18} />
            </span>
            <p className="mt-3 text-2xl font-bold">{s.value}</p>
            <p className={`text-xs ${mutedText}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {topItem && (
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="absolute -right-12 -bottom-16 h-48 w-48 rounded-full border-[32px] border-white/10" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              {lastOpened
                ? "Continue where you left off"
                : lessonsDone === 0
                  ? "Start here"
                  : "Up next"}
            </p>
            <h3 className="text-xl font-semibold mt-1">
              {topItem.label} · {topItem.title}
            </h3>
            <p className="text-sm text-emerald-100/90">
              {topItem.format === "slides"
                ? "A quick read before you start coding"
                : `Step ${topItem.completedSteps + 1} of ${topItem.totalSteps}`}
            </p>
          </div>
          <button
            onClick={() => navigate(`/learn/${topItem.id}`)}
            className="relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-semibold cursor-pointer transition-all active:scale-95"
          >
            <FiPlay /> {topItem.started ? "Continue" : "Start"}
          </button>
        </div>
      )}

      {/* a short slice of the lesson list, starting at the next one to do */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold">Python Basics</h3>
            <p className={`text-sm ${mutedText}`}>
              {lessonsDone} / {lessons.length} lessons complete
            </p>
          </div>
          <button onClick={() => selectView("lessons")} className={linkButton}>
            View all{" "}
            <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
        <ProgressBar
          percent={lessons.length ? (lessonsDone / lessons.length) * 100 : 0}
        />
        <div className={`${cardClass} p-2!`}>
          {lessons
            .map((lesson, i) => ({ lesson, i }))
            .slice(
              Math.max(nextLessonIndex, 0),
              Math.max(nextLessonIndex, 0) + 3,
            )
            .map(({ lesson, i }) => (
              <LessonRow key={lesson.id} lesson={lesson} i={i} />
            ))}
          {nextLessonIndex === -1 && (
            <p className={`p-3 text-sm ${mutedText}`}>
              All lessons done. Nice work! 🎉
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <h3 className="text-lg font-semibold">Projects</h3>
          <button onClick={() => selectView("projects")} className={linkButton}>
            View all{" "}
            <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.slice(0, 2).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <FreePracticeCard />

      {/* below xl the right rail is hidden, so the calendar lives here instead */}
      <div className="xl:hidden">
        <StreakCalendar isDarkMode={isDarkMode} />
      </div>
    </div>
  );

  // ---- LESSONS PAGE ----
  const renderLessons = () => (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <p className={`text-sm ${mutedText}`}>
          Short lessons, one idea at a time. Read it, try it in the editor, and
          Codey checks it.
        </p>
        <p className={`text-sm shrink-0 ${mutedText}`}>
          {lessonsDone} / {lessons.length} lessons complete
        </p>
      </div>
      <ProgressBar
        percent={lessons.length ? (lessonsDone / lessons.length) * 100 : 0}
      />
      <div className={`${cardClass} p-2!`}>
        {lessons.map((lesson, i) => (
          <LessonRow key={lesson.id} lesson={lesson} i={i} />
        ))}
      </div>
    </section>
  );

  // ---- PROJECTS PAGE ----
  const renderProjects = () => (
    <section className="space-y-4">
      <p className={`text-sm ${mutedText}`}>
        Build a real program step by step, using what the lessons taught you.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <FreePracticeCard />
    </section>
  );

  // ---- Settings page ----
  // Only what exists today; more preferences land here as they're built.
  const renderSettings = () => (
    <div className="space-y-4 max-w-2xl">
      <div className={cardClass}>
        <h3 className="font-semibold">Account</h3>
        <dl className="mt-4 grid grid-cols-[100px_1fr] gap-y-3 text-sm">
          <dt className={mutedText}>Name</dt>
          <dd className="font-medium">{user?.name || "—"}</dd>
          <dt className={mutedText}>Email</dt>
          <dd className="font-medium break-all">{user?.email || "—"}</dd>
        </dl>
      </div>
      <div className={`${cardClass} flex items-center justify-between gap-4`}>
        <div>
          <h3 className="font-semibold">Appearance</h3>
          <p className={`text-sm ${mutedText}`}>
            {isDarkMode ? "Dark" : "Light"} mode
          </p>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`${secondaryButton} flex items-center gap-2`}
        >
          {isDarkMode ? <FiSun /> : <FiMoon />} Switch to{" "}
          {isDarkMode ? "light" : "dark"}
        </button>
      </div>
      <div className={`${cardClass} border-dashed`}>
        <h3 className="font-semibold">More coming soon</h3>
        <p className={`text-sm ${mutedText}`}>
          Profile editing, password change and reminders will live here.
        </p>
      </div>
    </div>
  );

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className={`min-h-screen w-full flex transition-colors duration-300 ${
        isDarkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Sidebar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        view={view}
        onSelectView={selectView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* top bar */}
        <header
          className={`h-16 shrink-0 sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 border-b backdrop-blur-md ${
            isDarkMode
              ? "bg-gray-950/80 border-gray-800"
              : "bg-gray-50/80 border-gray-200"
          }`}
        >
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-500/20 cursor-pointer"
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight">
              {VIEWS[view].title}
            </h1>
            <p className={`text-xs truncate ${mutedText}`}>
              {VIEWS[view].subtitle}
            </p>
          </div>
          <ServerStatusPill className="ml-auto hidden md:inline-flex" />
          <button
            onClick={() => navigate("/app")}
            className="ml-auto md:ml-0 flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white cursor-pointer transition-all active:scale-95"
          >
            <FiCode size={16} />
            <span className="hidden sm:inline">Free Practice</span>
          </button>
        </header>

        {/* Main section */}
        <div className="flex-1 flex">
          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
              {/* if overview then show , user greetings */}
              {view === "overview" && (
                <div className="mb-6">
                  <p className={`text-sm ${mutedText}`}>{today}</p>
                  <h2 className="text-2xl font-bold mt-1">
                    Hi{user?.name ? ` ${user.name}` : ""} 👋
                  </h2>
                  <p className={`mt-1 ${mutedText}`}>
                    What do you want to do today?
                  </p>
                </div>
              )}

              {/* According to the sidebar , show that component */}
              {view === "settings" ? (
                renderSettings()
              ) : isLoading ? (
                <p className={`text-sm animate-pulse ${mutedText}`}>
                  Loading your lessons...
                </p>
              ) : error ? (
                <div className="p-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-sm">
                  {error}
                </div>
              ) : view === "lessons" ? (
                renderLessons()
              ) : view === "projects" ? (
                renderProjects()
              ) : (
                renderOverview()
              )}
            </div>
          </main>

          {/* right rail - Streak calander */}
          <aside
            className={`hidden xl:block w-80 shrink-0 border-l px-5 py-8 ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}
          >
            <div className="sticky top-24">
              <StreakCalendar isDarkMode={isDarkMode} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
