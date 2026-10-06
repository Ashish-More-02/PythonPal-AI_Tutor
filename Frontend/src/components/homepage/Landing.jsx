import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import {
  FiSun,
  FiMoon,
  FiArrowRight,
  FiPlay,
  FiCheck,
  FiX,
  FiBookOpen,
  FiCode,
  FiFolder,
  FiMessageCircle,
  FiTrendingUp,
  FiEdit3,
  FiTerminal,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import { FaPython } from "react-icons/fa";
import { useDarkMode } from "../../context/DarkModeContext";
import { useAuth } from "../../context/AuthContext";
import ServerStatusPill from "../ServerStatusPill";

// Mirrors Backend/utils/lessons.js + projects.js. The curriculum endpoint is
// behind auth, so the public page keeps its own copy — update both together.
const LESSONS = [
  "Why Python?",
  "Printing & comments",
  "Variables & data types",
  "Maths with Python",
  "Working with text",
  "Asking the user",
  "Making decisions",
  "Repeating with for",
  "Repeating with while",
  "Lists",
  "Functions",
];

const PROBLEMS = [
  {
    title: "Tutorials make you watch",
    body: "Hours of videos feel like progress, until you open a blank file and don't know where to start.",
  },
  {
    title: "No clear path",
    body: "Endless courses, no order, no finish line. Too much choice is how most beginners quit.",
  },
  {
    title: "Chatbots hand you the answer",
    body: "Copy, paste, it works, and you've learned nothing. Next time you're just as stuck.",
  },
];

const STEPS = [
  { icon: FiBookOpen, title: "Read one idea", body: "A short explanation with an example. Never a wall of text." },
  { icon: FiEdit3, title: "Write the code", body: "Every step ends in the editor. You type it yourself." },
  { icon: FiPlay, title: "Run it", body: "Real Python runs right in your browser, with the output beside your code." },
  { icon: FiCheckCircle, title: "Check with Codey", body: "Codey reads your code and output, then says what's good and gives one hint if you're not there yet." },
];

const FEATURES = [
  {
    icon: FiBookOpen,
    title: "Python Basics, in order",
    body: "11 short lessons from your first print() to writing functions. One concept each, with exercises straight after the explanation.",
  },
  {
    icon: RiRobot2Line,
    title: "Hints, not answers",
    body: "\"Check my code\" saves, runs and reviews in one click. If you're not there yet, Codey asks a question that points you the right way.",
  },
  {
    icon: FiCode,
    title: "A real code editor",
    body: "The same kind of editor developers use, with syntax highlighting and a terminal for output. Nothing to install.",
  },
  {
    icon: FiFolder,
    title: "Free Practice workspace",
    body: "Your own folders and files, saved to your account. Build whatever you want, whenever you want.",
  },
  {
    icon: FiMessageCircle,
    title: "Codey sees your code",
    body: "Ask about the file you have open and Codey answers about your code, not a generic example. Your chats are saved so you can go back to them.",
  },
  {
    icon: FiTrendingUp,
    title: "Pick up where you left off",
    body: "Progress and code are saved for every lesson. Come back tomorrow and the dashboard takes you straight back.",
  },
];

const COMPARISON = [
  { label: "Gives hints instead of answers", us: true, gpt: false, course: false, editor: false },
  { label: "Reviews your own code", us: true, gpt: true, course: false, editor: false },
  { label: "A clear path from zero", us: true, gpt: false, course: true, editor: false },
  { label: "Write & run code in the browser", us: true, gpt: false, course: true, editor: true },
  { label: "Saves your work and progress", us: true, gpt: false, course: true, editor: true },
];

// Python snippets drifting behind the hero. Kept to the edges so they never
// sit under the headline; `hidden md:block` ones would crowd a phone.
const HERO_TOKENS = [
  { text: "print()", top: "10%", left: "4%", delay: "0s", cls: "text-emerald-500 text-lg" },
  { text: "def greet(name):", top: "78%", left: "3%", delay: "-4s", cls: "text-blue-400 hidden md:block" },
  { text: "for i in range(10):", top: "6%", left: "40%", delay: "-8s", cls: "text-purple-400 hidden md:block" },
  { text: "[1, 2, 3]", top: "88%", left: "38%", delay: "-2s", cls: "text-yellow-500 hidden sm:block" },
  { text: ">>>", top: "45%", left: "1%", delay: "-6s", cls: "text-emerald-500 text-xl hidden lg:block" },
  { text: "True", top: "14%", left: "90%", delay: "-10s", cls: "text-blue-400" },
  { text: "{ }", top: "82%", left: "92%", delay: "-3s", cls: "text-purple-400 text-2xl" },
  { text: "if x > 0:", top: "52%", left: "94%", delay: "-12s", cls: "text-yellow-500 hidden lg:block" },
  { text: "🐍", top: "70%", left: "52%", delay: "-7s", cls: "text-2xl hidden lg:block" },
  { text: 'f"{name}"', top: "30%", left: "60%", delay: "-5s", cls: "text-emerald-500 hidden xl:block" },
];

// Footer links back into the page.
const FOOTER_LINKS = [
  { href: "#why", label: "Why PythonPal" },
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#curriculum", label: "Curriculum" },
];

// Tailwind classes that flip with dark mode, built once per render so the
// sections below don't each repeat the same ternaries.
const themeClasses = (dark) => ({
  page: dark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900",
  muted: dark ? "text-gray-400" : "text-gray-600",
  card: dark ? "bg-gray-900/70 border-gray-800" : "bg-white border-gray-200",
  soft: dark ? "bg-gray-900/40" : "bg-white",
  border: dark ? "border-gray-800" : "border-gray-200",
  chip: dark ? "bg-gray-800/80 text-gray-300 border-gray-700" : "bg-white/80 text-gray-700 border-gray-200",
  secondaryBtn: dark
    ? "bg-gray-800/80 hover:bg-gray-700 border-gray-700 hover:border-gray-600"
    : "bg-white hover:bg-gray-100 border-gray-300 hover:border-gray-400",
});

// Lift + glow on hover, press-in on click, and a light sweep across the face.
const primaryBtn =
  "group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl px-6 py-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 active:translate-y-0 active:scale-[0.98] before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-full";
const secondaryBtnBase =
  "font-semibold rounded-xl px-6 py-3 border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";
// Hover lift shared by every card on the page.
const cardHover =
  "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/50";
const navLink =
  "relative py-1 transition-colors hover:text-emerald-500 after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:rounded-full after:bg-emerald-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100";

const Arrow = () => <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />;

// Fades its children up the first time they scroll into view. The delay
// staggers items in a grid; it sits on this wrapper so it never slows the
// inner card's hover transitions.
const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${isVisible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

const SectionHeading = ({ eyebrow, title, body, t }) => (
  <Reveal className="max-w-2xl mx-auto text-center">
    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">{eyebrow}</p>
    <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
    {body && <p className={`mt-4 text-lg ${t.muted}`}>{body}</p>}
  </Reveal>
);

// A static picture of the lesson screen: a classic beginner bug, the output it
// gives, and the kind of hint Codey replies with.
const EditorPreview = ({ t, isDarkMode }) => {
  const kw = "text-purple-400";
  const fn = "text-yellow-300";
  const num = "text-emerald-300";
  const cm = "text-gray-500";

  return (
    <div className="relative group/preview">
      <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-500/25 via-blue-500/15 to-transparent blur-3xl rounded-full" />
      <div className="relative rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden text-left transition-transform duration-500 ease-out group-hover/preview:-translate-y-1 group-hover/preview:rotate-[-0.5deg]">
        {/* window bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-950/60">
          <span className="h-3 w-3 rounded-full bg-red-400/80 transition-transform hover:scale-125" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/80 transition-transform hover:scale-125" />
          <span className="h-3 w-3 rounded-full bg-green-400/80 transition-transform hover:scale-125" />
          <span className="ml-3 text-xs text-gray-400 font-mono">lessons/for-loops.py</span>
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold rounded-md px-2 py-1 transition-colors hover:bg-emerald-500/10 cursor-default">
            <FiPlay size={12} /> Run
          </span>
        </div>

        {/* code */}
        <pre className="px-4 py-4 text-sm leading-6 font-mono text-gray-200 overflow-x-auto">
          <code>
            <span className={cm}># Lesson 7 · Adding things up</span>
            {"\n"}total = <span className={num}>0</span>
            {"\n"}<span className={kw}>for</span> n <span className={kw}>in</span> <span className={fn}>range</span>(<span className={num}>1</span>, <span className={num}>101</span>):
            {"\n"}    total = n
            {"\n"}<span className={fn}>print</span>(total)
            <span className="inline-block w-2 h-4 -mb-0.5 ml-0.5 bg-emerald-400 animate-blink" />
          </code>
        </pre>

        {/* output */}
        <div className="border-t border-gray-800 px-4 py-3 font-mono text-sm">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <FiTerminal size={12} /> Output
          </p>
          <p className="text-gray-200">100</p>
        </div>
      </div>

      {/* Codey's reply, bobbing gently over the editor */}
      <div className="relative sm:absolute sm:-bottom-10 sm:-right-6 mt-4 sm:mt-0 sm:w-80 motion-safe:animate-float">
        <div
          className={`rounded-2xl border p-4 shadow-xl transition-all duration-300 hover:scale-[1.03] hover:border-emerald-500/50 ${t.card} ${
            isDarkMode ? "backdrop-blur" : "shadow-gray-300/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="relative h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <RiRobot2Line />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-gray-900" />
            </span>
            <div>
              <p className="text-sm font-semibold">Codey</p>
              <p className="text-xs text-amber-500 font-medium">Not quite yet</p>
            </div>
          </div>
          <p className={`mt-3 text-sm ${t.muted}`}>
            Nice, your loop runs 100 times! But the total should be 5050.
          </p>
          <p className="mt-2 text-sm rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
            💡 Is <span className="font-mono">total</span> growing each time the loop runs, or being replaced?
          </p>
        </div>
      </div>
    </div>
  );
};

// The public homepage: what PythonPal is, why it exists, and the way in.
const Landing = () => {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const t = themeClasses(isDarkMode);

  // The nav only gets its border + shadow once the page moves, so the hero
  // background runs up to the top edge.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Already logged in? Skip the homepage and go straight to the product —
  // unless they asked for it by clicking the logo on the dashboard.
  if (isAuthenticated && !location.state?.showLanding) {
    return <Navigate to="/dashboard" replace />;
  }

  // Hero glow follows the cursor. Written to CSS vars, not state, so moving
  // the mouse doesn't re-render the page.
  // Scroll in JS instead of letting the hash change: React Router treats a new
  // hash as a navigation without showLanding, which bounces logged-in users.
  const scrollToSection = (e) => {
    e.preventDefault();
    document.querySelector(e.currentTarget.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
  };

  const trackSpotlight = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  // Logged-in visitors (only here via the dashboard logo) get a way back
  // instead of sign-up buttons.
  const ctas = isAuthenticated ? (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <Link to="/dashboard" className={primaryBtn}>
        Go to Dashboard <Arrow />
      </Link>
      <button onClick={logout} className={`${secondaryBtnBase} ${t.secondaryBtn}`}>
        Logout
      </button>
    </div>
  ) : (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <Link to="/signup" className={primaryBtn}>
        Start learning free <Arrow />
      </Link>
      <Link to="/signin" className={`${secondaryBtnBase} ${t.secondaryBtn}`}>
        I have an account
      </Link>
    </div>
  );

  return (
    <div className={`landing min-h-screen flex flex-col transition-colors duration-300 ${t.page}`}>
      {/* nav */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-md border-b transition-all duration-300 ${
          isScrolled
            ? `${t.border} shadow-sm ${isDarkMode ? "bg-gray-950/80" : "bg-gray-50/80"}`
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 px-3 min-[380px]:px-4 sm:px-6 py-3">
          <Link
            to="/"
            // Keep showLanding, or a logged-in visitor gets bounced to the dashboard.
            state={{ showLanding: true }}
            className="shrink-0 text-lg min-[380px]:text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-green-400 bg-[length:200%_auto] bg-clip-text text-transparent transition-[background-position] duration-700 hover:bg-right"
          >
            PythonPal 🐍
          </Link>
          <nav className={`hidden md:flex items-center gap-8 text-sm font-medium ${t.muted}`}>
            {FOOTER_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={scrollToSection} className={navLink}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ServerStatusPill compact />
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-500/20 transition-all duration-200 hover:rotate-12 active:scale-90 cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {/* keyed so the icon spins in fresh on every toggle */}
              <span key={String(isDarkMode)} className="block animate-spin-in">
                {isDarkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
              </span>
            </button>
            {isAuthenticated ? (
              <Link to="/dashboard" className="whitespace-nowrap text-sm font-semibold rounded-lg px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-all hover:-translate-y-0.5 active:scale-95">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signin" className="hidden sm:inline text-sm font-semibold rounded-lg px-4 py-2 transition-colors hover:bg-gray-500/20">
                  Login
                </Link>
                <Link to="/signup" className="whitespace-nowrap text-sm font-semibold rounded-lg px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-500/30 active:scale-95">
                  {/* "Get started" doesn't fit beside the status pill on 320px phones */}
                  <span className="min-[380px]:hidden">Start</span>
                  <span className="hidden min-[380px]:inline">Get started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* hero; -mt pulls it under the transparent nav so its background reaches the top */}
        <section onMouseMove={trackSpotlight} className="relative -mt-16 pt-16 overflow-hidden isolate">
          {/* background: grid, drifting blobs, cursor glow, floating code */}
          <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0 landing-grid" />
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl animate-blob" />
            <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl animate-blob [animation-delay:-5s]" />
            <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl animate-blob [animation-delay:-9s]" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(500px circle at var(--mx, 30%) var(--my, 40%), rgb(16 185 129 / 0.10), transparent 60%)",
              }}
            />
            {HERO_TOKENS.map((tok) => (
              <span
                key={tok.text}
                className={`absolute font-mono font-semibold opacity-25 select-none animate-drift ${tok.cls}`}
                style={{ top: tok.top, left: tok.left, animationDelay: tok.delay }}
              >
                {tok.text}
              </span>
            ))}
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24 sm:pt-24 grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <Reveal>
                <span className={`inline-flex items-center gap-2 text-xs font-semibold rounded-full border px-3 py-1 backdrop-blur ${t.chip}`}>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <FaPython className="text-blue-400" /> For complete beginners · No setup needed
                </span>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  Learn Python by{" "}
                  <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
                    building
                  </span>
                  , not watching.
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p className={`mt-6 text-lg max-w-xl mx-auto lg:mx-0 ${t.muted}`}>
                  Short lessons, a real code editor and Codey, an AI mentor who reviews <em>your</em> code and
                  nudges you forward with hints, never the answer. Go from zero to writing Python on your own.
                </p>
                {isAuthenticated && (
                  <p className={`mt-6 ${t.muted}`}>You&apos;re logged in{user?.name ? ` as ${user.name}` : ""}.</p>
                )}
              </Reveal>
              <Reveal delay={300} className="mt-8 flex justify-center lg:justify-start">
                {ctas}
              </Reveal>
              <Reveal delay={400}>
                <div className={`mt-8 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm ${t.muted}`}>
                  {["11 guided lessons", "Runs in your browser", "Progress saved"].map((item) => (
                    <span key={item} className="group inline-flex items-center gap-1.5 transition-colors hover:text-emerald-500">
                      <FiCheck className="text-emerald-500 transition-transform group-hover:scale-125" /> {item}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
            <Reveal delay={250}>
              <EditorPreview t={t} isDarkMode={isDarkMode} />
            </Reveal>
          </div>
        </section>

        {/* why */}
        <section id="why" className={`scroll-mt-16 py-24 border-y ${t.border} ${t.soft}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              t={t}
              eyebrow="Why we built this"
              title="Most beginners don't fail. They get stuck and quit."
              body="People learn to code by writing code, with someone pointing them the right way when they get stuck. PythonPal is the guide we wish we'd had."
            />
            <div className="mt-14 grid md:grid-cols-3 gap-6">
              {PROBLEMS.map((p, i) => (
                <Reveal key={p.title} delay={i * 100}>
                  <div className={`group h-full rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5 hover:border-red-500/40 ${t.card}`}>
                    <span className="h-9 w-9 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center group-hover:animate-wiggle">
                      <FiX />
                    </span>
                    <h3 className="mt-4 font-semibold text-lg">{p.title}</h3>
                    <p className={`mt-2 text-sm leading-6 ${t.muted}`}>{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={300}>
              <div className="group mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300 hover:bg-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/10">
                <span className="h-10 w-10 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <FiZap />
                </span>
                <p className="text-base">
                  <span className="font-semibold">PythonPal fixes all three:</span>{" "}
                  <span className={t.muted}>
                    you write every line yourself, follow one clear path, and get feedback that makes you think
                    instead of copy.
                  </span>
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* how it works */}
        <section id="how" className="scroll-mt-16 py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              t={t}
              eyebrow="How it works"
              title="One simple loop, every step"
              body="Lessons and projects all work the same way, so you always know what to do next."
            />
            <ol className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <Reveal delay={i * 100} className="h-full">
                    <div className={`group relative h-full rounded-2xl border p-6 overflow-hidden ${cardHover} ${t.card}`}>
                      {/* progress line that fills along the top on hover */}
                      <span className="absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-emerald-500 to-blue-500 scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" />
                      <div className="flex items-center justify-between">
                        <span className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110">
                          <s.icon size={20} />
                        </span>
                        <span className={`text-4xl font-bold transition-colors duration-300 group-hover:text-emerald-500/40 ${isDarkMode ? "text-gray-800" : "text-gray-200"}`}>
                          {i + 1}
                        </span>
                      </div>
                      <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
                      <p className={`mt-2 text-sm leading-6 ${t.muted}`}>{s.body}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
            <Reveal>
              <p className={`mt-8 text-center text-sm ${t.muted}`}>
                Passed? On to the next step. Not yet? Fix it, run it, check again. Nothing is locked, so you can
                come back to any lesson.
              </p>
            </Reveal>
          </div>
        </section>

        {/* features */}
        <section id="features" className={`scroll-mt-16 py-24 border-y ${t.border} ${t.soft}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              t={t}
              eyebrow="Features"
              title="Everything you need to learn, in one tab"
              body="A course, a code editor and a patient mentor that work together, instead of three separate tools."
            />
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={(i % 3) * 100}>
                  <div className={`group h-full rounded-2xl border p-6 ${cardHover} ${t.card}`}>
                    <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                      <f.icon size={20} />
                    </span>
                    <h3 className="mt-4 font-semibold text-lg transition-colors group-hover:text-emerald-500">{f.title}</h3>
                    <p className={`mt-2 text-sm leading-6 ${t.muted}`}>{f.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* curriculum */}
        <section id="curriculum" className="scroll-mt-16 py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-start">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Curriculum</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">From your first line to your first program</h2>
              <p className={`mt-4 text-lg ${t.muted}`}>
                <span className="font-semibold text-emerald-500">Python Basics</span> teaches the language one
                idea at a time. <span className="font-semibold text-emerald-500">Projects</span> show you how
                to put those ideas together into something real.
                <span className="font-semibold text-emerald-500"> Free Practice</span> is where you build
                your own ideas.
              </p>

              <div className={`group mt-8 rounded-2xl border p-6 ${cardHover} ${t.card}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Project</p>
                  <span className={`text-xs rounded-full border px-2 py-0.5 ${t.chip}`}>Step by step</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold">Tip Calculator</h3>
                <p className={`mt-1 text-sm ${t.muted}`}>
                  Build a real program that asks for a bill, works out the tip and total, using
                  everything the first six lessons taught you.
                </p>
                {/* the bar fills up on hover, like finishing the project */}
                <div className={`mt-4 h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-gray-200"}`}>
                  <div className="h-full w-3/5 bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-700 ease-out group-hover:w-full" />
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <ol className={`rounded-2xl border p-2 ${t.card}`}>
                {LESSONS.map((title, i) => (
                  <li
                    key={title}
                    className="group flex items-center gap-4 p-3 rounded-xl cursor-default transition-all duration-200 hover:bg-emerald-500/5 hover:pl-5"
                  >
                    <span
                      className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold border transition-transform duration-200 group-hover:scale-110 ${
                        i < 3
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : i === 3
                          ? "border-emerald-500 text-emerald-400"
                          : isDarkMode
                          ? "bg-gray-800 border-gray-700 text-gray-300 group-hover:border-emerald-500/60"
                          : "bg-gray-100 border-gray-200 text-gray-700 group-hover:border-emerald-500/60"
                      }`}
                    >
                      {i < 3 ? <FiCheck /> : i}
                    </span>
                    <span className="font-medium transition-colors group-hover:text-emerald-500">{title}</span>
                    {i === 0 && <span className={`ml-auto text-xs ${t.muted}`}>Quick read</span>}
                    {i === 3 && (
                      <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Up next
                      </span>
                    )}
                    {i > 3 && (
                      <FiArrowRight className={`ml-auto opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 ${t.muted}`} />
                    )}
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* comparison */}
        <section className={`py-24 border-y ${t.border} ${t.soft}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <SectionHeading
              t={t}
              eyebrow="The difference"
              title="Not just another chatbot or course"
              body="Each of these tools does one part well. PythonPal puts the parts together for someone starting from zero."
            />
            <Reveal>
              <div className={`mt-14 rounded-2xl border overflow-x-auto transition-shadow duration-300 hover:shadow-xl hover:shadow-emerald-500/5 ${t.card}`}>
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className={`border-b ${t.border}`}>
                      <th className="text-left font-medium p-4" />
                      <th className="p-4 font-semibold text-emerald-500">PythonPal</th>
                      <th className={`p-4 font-medium ${t.muted}`}>AI chatbots</th>
                      <th className={`p-4 font-medium ${t.muted}`}>Video courses</th>
                      <th className={`p-4 font-medium ${t.muted}`}>Online editors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row) => (
                      <tr key={row.label} className={`group border-b last:border-b-0 transition-colors hover:bg-emerald-500/5 ${t.border}`}>
                        <td className="p-4 font-medium">{row.label}</td>
                        {[row.us, row.gpt, row.course, row.editor].map((has, i) => (
                          <td key={i} className={`p-4 text-center ${i === 0 ? "bg-emerald-500/5" : ""}`}>
                            {has ? (
                              <FiCheck
                                className={`inline transition-transform duration-200 ${
                                  i === 0 ? "text-emerald-500 group-hover:scale-125" : t.muted
                                }`}
                                size={18}
                              />
                            ) : (
                              <FiX className="inline text-gray-500/60" size={18} />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </section>

        {/* final CTA */}
        <section className="py-24 px-4 sm:px-6">
          <Reveal>
            <div className="group relative overflow-hidden isolate max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-emerald-600 via-blue-600 to-emerald-600 bg-[length:200%_200%] animate-gradient text-white text-center px-6 py-16 shadow-xl transition-transform duration-500 hover:scale-[1.01]">
              {/* soft light rings for depth */}
              <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full border-[40px] border-white/5 -z-10 transition-transform duration-700 group-hover:scale-110" aria-hidden="true" />
              <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full border-[48px] border-white/5 -z-10 transition-transform duration-700 group-hover:scale-110" aria-hidden="true" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Write your first line of Python today</h2>
              <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
                Sign up in a minute and start with Lesson 0. Codey will be there for every step.
              </p>
              <div className="mt-8">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/signup"}
                  className="group/btn inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 font-semibold rounded-xl px-6 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Start learning free"}
                  <FiArrowRight className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className={`relative overflow-hidden isolate border-t ${t.border}`}>
        {/* a snake slithering along the top edge */}
        <svg className="absolute top-0 left-0 w-full h-16 -z-10" viewBox="0 0 1200 64" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="snake" x1="0" x2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <path
            d="M0 32 Q 75 4 150 32 T 300 32 T 450 32 T 600 32 T 750 32 T 900 32 T 1050 32 T 1200 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-500/15"
            strokeDasharray="4 8"
          />
          <path
            d="M0 32 Q 75 4 150 32 T 300 32 T 450 32 T 600 32 T 750 32 T 900 32 T 1050 32 T 1200 32"
            fill="none"
            stroke="url(#snake)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="160 1540"
            className="animate-slither opacity-60"
          />
        </svg>

        {/* giant faded wordmark behind everything */}
        <p
          className="absolute -bottom-[0.18em] left-1/2 -translate-x-1/2 -z-10 text-[22vw] font-black leading-none tracking-tighter whitespace-nowrap select-none bg-gradient-to-b from-emerald-500/15 to-transparent bg-clip-text text-transparent"
          aria-hidden="true"
        >
          PythonPal
        </p>
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 h-80 w-[60%] rounded-full bg-emerald-500/10 blur-3xl -z-10" aria-hidden="true" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-32 sm:pb-44 grid gap-10 md:grid-cols-3">
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">PythonPal 🐍</span>
            <p className={`mt-3 text-sm max-w-xs ${t.muted}`}>
              Learn Python by building, not watching. An AI mentor that reviews your code and guides your next step.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <p className="font-semibold mb-1">Explore</p>
            {FOOTER_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={scrollToSection} className={`group inline-flex items-center gap-1 w-fit transition-colors hover:text-emerald-500 ${t.muted}`}>
                {l.label}
                <FiArrowRight size={12} className="opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </a>
            ))}
          </nav>

          <div>
            <p className="font-semibold mb-3 text-sm">Your first line awaits</p>
            {/* a tiny terminal that types itself, on loop */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 font-mono text-sm text-gray-200 shadow-lg transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <span className="text-emerald-400 mr-2">&gt;&gt;&gt;</span>
                <span className="inline-block overflow-hidden whitespace-nowrap align-bottom animate-typing">
                  print(&quot;Keep building&quot;)
                </span>
                <span className="inline-block w-2 h-4 ml-0.5 bg-emerald-400 animate-blink" />
              </div>
            </div>
            {!isAuthenticated && (
              <Link to="/signup" className="group mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-500 hover:text-emerald-400">
                Create your free account <Arrow />
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
