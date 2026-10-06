import React from "react";
import { useServerStatus } from "../context/ServerStatusContext";

const LABELS = {
  checking: "Connecting...",
  booting: "Server starting",
  online: "Online",
  down: "Server unavailable · Retry",
};

const DOT = {
  checking: "bg-gray-400 animate-pulse",
  booting: "bg-amber-400 animate-pulse",
  online: "bg-emerald-500",
  down: "bg-red-500",
};

const TITLES = {
  checking: "Checking Codey's server...",
  booting: "Our server naps when nobody's around. Waking it can take up to a minute.",
  online: "Codey's server is up and ready",
  down: "We couldn't reach the server. Click to try again.",
};

// Phone-width labels for `compact`: the dot carries the meaning, text only where it adds info.
const SHORT_LABELS = {
  checking: "",
  booting: "",
  online: "",
  down: "Retry",
};

// Small always-visible indicator so kids (and parents) can tell "still booting"
// apart from "broken". Clickable only when it's down. `compact` shrinks it below sm.
const ServerStatusPill = ({ className = "", compact = false }) => {
  const { status, seconds, retry } = useServerStatus();
  const isDown = status === "down";

  return (
    <button
      type="button"
      onClick={isDown ? retry : undefined}
      disabled={!isDown}
      title={TITLES[status]}
      aria-label={TITLES[status]}
      className={`inline-flex shrink-0 items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs font-medium rounded-full py-1 border ${
        compact ? "px-2 sm:px-3" : "px-3"
      } ${
        isDown ? "border-red-500/50 text-red-500 cursor-pointer hover:bg-red-500/10" : "border-gray-500/30 cursor-default"
      } ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${DOT[status]}`} />
      <span className={compact ? "hidden sm:inline" : ""}>{LABELS[status]}</span>
      {compact && SHORT_LABELS[status] && <span className="sm:hidden">{SHORT_LABELS[status]}</span>}
      {status === "booting" && <span className="tabular-nums opacity-70">{seconds}s</span>}
    </button>
  );
};

export default ServerStatusPill;
