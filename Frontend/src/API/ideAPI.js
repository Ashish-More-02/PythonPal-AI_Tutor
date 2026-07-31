const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/ide`
  : "http://localhost:3000/api/ide";

// Helper to inject token dynamically from localStorage
const getAuthHeaders = (token) => {
  const authToken = token || localStorage.getItem("pythonpal-token");
  return {
    "Content-Type": "application/json",
    Authorization: authToken ? `Bearer ${authToken}` : "",
  };
};

// the ideApi object have all these functions like fetchWorkspace, createNode
export const ideApi = {
  // 1. Fetch entire workspace structure
  fetchWorkspace: async function (token) {
    const res = await fetch(`${API_BASE_URL}/workspace`, {
      method:"GET",
      headers: getAuthHeaders(token),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(
        json.error || `Failed to fetch workspace (${res.status})`,
      );
    }
    // we return the data of complete files and folders in a flat array ( not nested till now)
    return json.data;
  },

  // 2. Create file/folder
  createNode: async function ({ name, path, type, parentId }, token) {
    const res = await fetch(`${API_BASE_URL}/nodes`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ name, path, type, parentId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Failed to create item (${res.status})`);
    }
    return json.data;
  },

  // 3. Save code changes (Used by Monaco)
  saveFile: async function (fileId, content, token) {
    const res = await fetch(`${API_BASE_URL}/files/${fileId}/save`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ content }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Failed to save file (${res.status})`);
    }
    return json.data;
  },

  // 4. Rename or Move items
  moveNode: async function (nodeId, { name, newPath }, token) {
    const res = await fetch(`${API_BASE_URL}/nodes/${nodeId}/move`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ name, newPath }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Failed to move item (${res.status})`);
    }
    return json;
  },

  // 5. Delete items
  deleteNode: async function (nodeId, token) {
    const res = await fetch(`${API_BASE_URL}/nodes/${nodeId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Failed to delete item (${res.status})`);
    }
    return json;
  },
};
