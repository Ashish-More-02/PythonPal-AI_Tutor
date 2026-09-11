// Helper to inject token dynamically from localStorage
const getAuthHeaders = (token) => {
  const authToken = token || localStorage.getItem("pythonpal-token");
  return {
    "Content-Type": "application/json",
    Authorization: authToken ? `Bearer ${authToken}` : "",
  };
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const saveChathistory = async ({ chatId, messages, title }, token) => {
  const res = await fetch(`${API_BASE}/ai/save_chat_history`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ chatId, messages, title }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || `Failed to save chat history (${res.status})`
    );
  }

  return data;
};

export const getChatHistories = async (token) => {
  const res = await fetch(`${API_BASE}/ai/get_chat_histories`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || `Failed to fetch chat histories (${res.status})`
    );
  }

  return data;
};

export const getChatHistoryById = async (chatId, token) => {
  const res = await fetch(`${API_BASE}/ai/get_chat_history/${chatId}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || `Failed to fetch chat history (${res.status})`
    );
  }

  return data;
};

export const deleteChatHistoryById = async (chatId, token) => {
  const res = await fetch(`${API_BASE}/ai/delete_chat_history/${chatId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || `Failed to delete chat history (${res.status})`
    );
  }

  return data;
};
