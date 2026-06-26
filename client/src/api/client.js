import axios from 'axios';

const TOKEN_KEY = 'cms_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

// Same-origin '/api' — Vite proxies it to the Express server in dev.
export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Session expired / invalid token: drop it and bounce to login.
    if (err.response?.status === 401) {
      setToken(null);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Extracts the Arabic error message from our consistent error shape.
export const apiError = (err) =>
  err?.response?.data?.error?.message || 'حدث خطأ، حاول مرة أخرى';
