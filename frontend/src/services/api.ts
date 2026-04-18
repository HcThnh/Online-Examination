import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        console.error('Unauthorized! Token expired or invalid.');
      } else if (status === 403) {
        console.error('Forbidden! You don\'t have permission.');
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
