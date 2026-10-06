import React from "react";
import { useServerStatus } from "../context/ServerStatusContext";

// Shown on sign in / sign up while the server boots (or can't be reached),
// so a slow submit doesn't look like the app is broken.
const ServerBootNotice = () => {
  const { status, seconds, retry } = useServerStatus();

  if (status === "down") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 my-2 text-sm">
        <p className="flex-1">
          We can't reach Codey's server right now.{" "}
          <span className="opacity-75">
            {navigator.onLine ? "It might be having a problem." : "Check your internet connection."}
          </span>
        </p>
        <button
          type="button"
          onClick={retry}
          className="shrink-0 rounded-md px-3 py-1 font-semibold bg-red-500 hover:bg-red-400 text-white cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (status !== "booting") return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 my-2 text-sm">
      <span className="h-4 w-4 shrink-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      <p>
        Waking up Codey's server... ({seconds}s){" "}
        <span className="opacity-75">
          {seconds < 30 ? "It naps when nobody's around." : "Almost there, the first start can take up to a minute."}
        </span>
      </p>
    </div>
  );
};

export default ServerBootNotice;
