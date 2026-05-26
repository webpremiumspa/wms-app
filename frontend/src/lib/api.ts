import axios from 'axios';
import { getToken, clearAuth } from './auth';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isPublic = err.config?.url?.includes('/public/');
      const onPublicPage = location.pathname.startsWith('/scan/');
      if (!isPublic && !onPublicPage) {
        clearAuth();
        if (location.pathname !== '/login') location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);
