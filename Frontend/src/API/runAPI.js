const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/run`
  : "http://localhost:3000/api/run";

// Helper to inject token dynamically from localStorage
const getAuthHeaders = (token) => {
  const authToken = token || localStorage.getItem("pythonpal-token");
  return {
    "Content-Type": "application/json",
    Authorization: authToken ? `Bearer ${authToken}` : "",
  };
};

// Runs Python on our backend, which holds the OnlineCompiler key.
// Returns { run: { output, stderr, ... } } — the shape Output.jsx renders.
export const runPython = async (code, input, token) => {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ code, input }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to run code (${res.status})`);
  }
  return json;
};
