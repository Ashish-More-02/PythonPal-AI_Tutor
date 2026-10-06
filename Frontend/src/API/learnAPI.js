const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/learn`
  : "http://localhost:3000/api/learn";

// Helper to inject token dynamically from localStorage
const getAuthHeaders = (token) => {
  const authToken = token || localStorage.getItem("pythonpal-token");
  return {
    "Content-Type": "application/json",
    Authorization: authToken ? `Bearer ${authToken}` : "",
  };
};

// Guided learning: lessons + projects share one "item" API.
export const learnApi = {
  // Returns { lessons, projects }, each with this user's progress (for the dashboard)
  fetchCurriculum: async function (token) {
    const res = await fetch(API_BASE_URL, {
      method: "GET",
      headers: getAuthHeaders(token),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Failed to load lessons (${res.status})`);
    }
    return json;
  },

  // Creates the item's file on first open. Returns { item, completedSteps, file }
  openItem: async function (itemId, token) {
    const res = await fetch(`${API_BASE_URL}/${itemId}/open`, {
      method: "POST",
      headers: getAuthHeaders(token),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Failed to open lesson (${res.status})`);
    }
    return json;
  },

  // "Mark as complete" for slides lessons. Returns { completedSteps }
  completeItem: async function (itemId, token) {
    const res = await fetch(`${API_BASE_URL}/${itemId}/complete`, {
      method: "POST",
      headers: getAuthHeaders(token),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Failed to mark lesson complete (${res.status})`);
    }
    return json;
  },

  // Returns { passed, feedback, hint, completedSteps }
  checkStep: async function (itemId, stepId, { code, output }, token) {
    const res = await fetch(`${API_BASE_URL}/${itemId}/steps/${stepId}/check`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ code, output }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Failed to check code (${res.status})`);
    }
    return json;
  },
};
