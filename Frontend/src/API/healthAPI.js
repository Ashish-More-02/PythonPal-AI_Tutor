const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Resolves true once the backend answers. On a cold Render instance this
// request just hangs until the server boots, so callers pass a timeout signal.
export const pingServer = async (signal) => {
  const res = await fetch(`${API_BASE}/health`, { signal, cache: "no-store" });
  return res.ok;
};
