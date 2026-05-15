import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 25000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('devflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    console.error(`[API] ${status ?? 'Network error'} on ${err.config?.url}`, err.response?.data ?? err.message);
    if (status === 401) {
      localStorage.removeItem('devflow_token');
      localStorage.removeItem('devflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
