import axios from 'axios';

// Bạn có thể thay đổi port nếu Spring Boot của bạn không chạy ở 8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.error('Unauthorized! Token expired or invalid.');
      } else if (status === 403) {
        console.error('Forbidden! You don\'t have permission.');
      } else if (status === 404) {
        console.error('Resource not found.');
      } else if (status >= 500) {
        console.error('Spring Boot Server Error!');
      }

      const backendMessage = error.response.data?.message;
      if (backendMessage) {
        console.error('Backend Message:', backendMessage);
      }
    } else if (error.request) {
      console.error('Network Error: Không thể kết nối tới Server Spring Boot.');
    }

    return Promise.reject(error);
  }
);

export default api;
