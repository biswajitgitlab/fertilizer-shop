/// <reference types="vite/client" />
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

export const publicApi = axios.create({
  baseURL,
  timeout: 15000,
});

// Request interceptor for apiClient
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for apiClient
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      toast.error("Session expired. Please log in again.");
    } else if (error.response?.status === 429) {
      toast.error("Rate limit exceeded! Too many requests. Please wait a minute.");
    } else if (error.response?.status === 422) {
      const msg = error.response?.data?.message || "Validation failed";
      toast.error(msg);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for publicApi
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      toast.error("Too many attempts! Please wait 1 minute before trying again.");
    }
    return Promise.reject(error);
  }
);
