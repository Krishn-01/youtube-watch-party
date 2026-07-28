const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
];

export const extractVideoId = (input) => {
  if (!input?.trim()) return null;

  const trimmed = input.trim();

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const getStoredUsername = () =>
  localStorage.getItem('watchparty_username') || '';

export const setStoredUsername = (username) =>
  localStorage.setItem('watchparty_username', username);

export const getStoredOdId = (roomId) =>
  localStorage.getItem(`watchparty_odId_${roomId}`) || null;

export const setStoredOdId = (roomId, odId) =>
  localStorage.setItem(`watchparty_odId_${roomId}`, odId);

export const clearStoredOdId = (roomId) =>
  localStorage.removeItem(`watchparty_odId_${roomId}`);
