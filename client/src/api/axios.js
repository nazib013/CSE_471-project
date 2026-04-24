import axios from 'axios';

// Determine API base URL with environment override and sensible fallback
function resolveBaseURL() {
  const envUrl = process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim();

  if (envUrl) {
    return `${envUrl}/api`;
  }

  return 'http://localhost:5000/api';
}

export const BASE_URL = resolveBaseURL();

const instance = axios.create({
  baseURL: BASE_URL,
});

instance.interceptors.request.use((config) => {
  const userRaw =
    typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;

  try {
    const user = userRaw ? JSON.parse(userRaw) : null;
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch (_) {
    // ignore malformed localStorage
  }

  return config;
});

export default instance;