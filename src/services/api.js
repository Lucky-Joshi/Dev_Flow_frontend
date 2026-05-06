import axios from 'axios';
import supabase from '../lib/supabase';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach the live Supabase access token to every request
API.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url;
    console.error(`[API] ${status ?? 'Network error'} on ${url}`, err.response?.data ?? err.message);

    if (status === 401) {
      supabase.auth.signOut();
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default API;
