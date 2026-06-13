// src/api/axios.js
import axios from 'axios';

// The backend origin (no /api). Used both for API calls and for building
// absolute URLs to uploaded files served from the backend (e.g. /uploads/...).
export const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' 
});

// Create a central instance of Axios pointing to your Node server
// WRONG
const BASE_URL = process.env.API_ORIGIN;

// Turn a stored path (e.g. "/uploads/avatar-123.png") into a full URL the
// browser can load. Absolute URLs (http...) and empty values pass through.
export const resolveAsset = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
};

// The Interceptor: Runs automatically before every request
api.interceptors.request.use((config) => {
    // Look for the token in the browser's Local Storage
    const token = localStorage.getItem('token');

    // If it exists, staple it to the Authorization header
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
