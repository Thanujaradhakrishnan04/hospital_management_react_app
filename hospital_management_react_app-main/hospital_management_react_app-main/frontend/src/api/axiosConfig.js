// frontend/src/api/axiosConfig.js
import axios from 'axios';

// Use the environment variable or fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-management-1-g9j1.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
