import axios from 'axios';

// Dynamically determine API base URL so Render, phone, local IP, or localhost all connect seamlessly
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    // If running on local machine or local Wi-Fi IP
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.')
    ) {
      return `http://${host}:5000/api`;
    }
    // Default fallback in production if environment variable was not specified
    return '/api';
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('barber_admin_token');
  const userToken = localStorage.getItem('barber_user_token');

  // If requesting an admin endpoint, prioritize admin token
  if (config.url?.includes('/admin') && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

// Response error handler helper
export function getErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.map((e: any) => e.message).join(', ');
  }
  if (error.message) {
    return error.message;
  }
  return 'Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.';
}
