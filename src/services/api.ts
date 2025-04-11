import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiError } from '../types';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

interface ErrorResponse {
  errors?: Record<string, string[]>;
  message?: string;
}

// Add a response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Extract error details
    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data as ErrorResponse;

    // Create API error object
    const err = {
      statusCode,
      message: errorData?.message || error.message,
      errors: errorData?.errors,
    } as ApiError;

    // Handle expired or invalid tokens
    if (statusCode === 401 && localStorage.getItem('token')) {
      // If we get a 401 and have a token, it means the token is invalid or expired
      // We'll handle the redirect in the AuthVerify component, so just clear the token here
      localStorage.removeItem('token');
    }

    return Promise.reject(err);
  },
);

export default api;
