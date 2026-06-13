// src/api/axios.js
import axios from 'axios';

// 1. Establish the clean server root (no trailing slash)
const SERVER_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 2. Create a central instance of Axios pointing to your Node server API
export const API = axios.create({ 
  // We append /api here so all your components can just ask for '/courses'
  baseURL: `${SERVER_ROOT}/api`, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Turn a stored path into a full URL the browser can load
export const resolveAsset = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  // Assets like profile pictures usually live at /uploads, not /api/uploads
  return `${SERVER_ROOT}${path.startsWith('/') ? '' : '/'}${path}`;
};

// 4. The Interceptor: Runs automatically before every request to attach tokens
API.interceptors.request.use(
  (config) => {
    // Look for the token in the browser's Local Storage
    const token = localStorage.getItem('token');

    // If it exists, staple it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;