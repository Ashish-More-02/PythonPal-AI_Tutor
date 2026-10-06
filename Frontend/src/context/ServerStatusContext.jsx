import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { pingServer } from "../API/healthAPI";

// Faster than this means the server was already awake, so we skip "booting".
const BOOTING_AFTER_MS = 2500;
const RETRY_EVERY_MS = 3000;
// A held request on a booting Render instance can hang; abort and retry instead.
const ATTEMPT_TIMEOUT_MS = 20 * 1000;
// Cold starts finish well under this; past it something is actually wrong.
const GIVE_UP_AFTER_MS = 90 * 1000;
// Keep-alive: a few pings while the tab is open, then let Render sleep.
const KEEPALIVE_EVERY_MS = 4 * 60 * 1000;
const MAX_KEEPALIVE_PINGS = 10;
// Render sleeps after ~15 idle minutes; after that the "online" we showed is stale.
const STALE_AFTER_MS = 14 * 60 * 1000;

const ServerStatusContext = createContext({ status: "checking", seconds: 0, retry: () => {} });

// Pings the backend the moment the app loads, so a sleeping Render instance
// starts booting while the kid is still on the landing page.
export const ServerStatusProvider = ({ children }) => {
  const [status, setStatus] = useState("checking"); // checking | booting | online | down
  const [seconds, setSeconds] = useState(0);
  const checkRef = useRef(() => {});
  const lastOnlineAt = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let tick = null;
    let timeouts = [];
    let keepalivesLeft = MAX_KEEPALIVE_PINGS;
    let inFlight = false;
    const later = (fn, ms) => timeouts.push(setTimeout(fn, ms));
    const clearAll = () => {
      clearInterval(tick);
      timeouts.forEach(clearTimeout);
      timeouts = [];
    };

    const pingOnce = async () => {
      try {
        return await pingServer(AbortSignal.timeout(ATTEMPT_TIMEOUT_MS));
      } catch {
        return false; // network error, timeout, or 502 while Render boots
      }
    };

    const keepalive = async () => {
      if (cancelled || keepalivesLeft <= 0) return;
      keepalivesLeft--;
      if (await pingOnce()) {
        lastOnlineAt.current = Date.now();
        later(keepalive, KEEPALIVE_EVERY_MS);
      } else if (!cancelled) {
        check(); // it died or fell asleep under us: back to the visible flow
      }
    };

    // Visible check: retry until online, or give up and show "down".
    const check = async () => {
      if (inFlight) return;
      inFlight = true;
      clearAll();
      keepalivesLeft = MAX_KEEPALIVE_PINGS;
      const startedAt = Date.now();
      setSeconds(0);
      tick = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
      later(() => setStatus((s) => (s === "online" ? s : "booting")), BOOTING_AFTER_MS);

      while (!cancelled) {
        if (await pingOnce()) {
          lastOnlineAt.current = Date.now();
          setStatus("online");
          break;
        }
        if (cancelled) break;
        if (Date.now() - startedAt > GIVE_UP_AFTER_MS) {
          setStatus("down");
          break;
        }
        setStatus("booting");
        await new Promise((r) => later(r, RETRY_EVERY_MS));
      }

      clearAll();
      inFlight = false;
      if (!cancelled && lastOnlineAt.current >= startedAt) later(keepalive, KEEPALIVE_EVERY_MS);
    };
    checkRef.current = check;

    // Kid came back after the keep-alive ran out: the server may be asleep,
    // so re-check (shows "booting" if it is). Cheap no-op while still fresh.
    const onActivity = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastOnlineAt.current > STALE_AFTER_MS) check();
    };
    const onOnline = () => check(); // wifi came back

    window.addEventListener("pointerdown", onActivity);
    window.addEventListener("keydown", onActivity);
    document.addEventListener("visibilitychange", onActivity);
    window.addEventListener("online", onOnline);

    check();
    return () => {
      cancelled = true;
      clearAll();
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      document.removeEventListener("visibilitychange", onActivity);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const retry = useCallback(() => checkRef.current(), []);

  return (
    <ServerStatusContext.Provider value={{ status, seconds, retry }}>
      {children}
    </ServerStatusContext.Provider>
  );
};

export const useServerStatus = () => useContext(ServerStatusContext);
