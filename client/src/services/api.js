const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
console.log("API_URL =", API_URL);

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const api = {
  createRoom: async (name, username) => {
    const response = await fetch(`${API_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username }),
    });
    return handleResponse(response);
  },

  getRoom: async (roomId) => {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}`);
    return handleResponse(response);
  },

  joinRoom: async (roomId, username) => {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    return handleResponse(response);
  },
};
