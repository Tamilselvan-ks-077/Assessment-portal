import axios from 'axios';
import { storageService } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: Attach JWT token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = storageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 unauthenticated & unwrap standard API data payload
apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      response.data.success === true &&
      response.data.data !== undefined
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      storageService.setCurrentUser(null);
      storageService.setToken(null);
    }
    return Promise.reject(error);
  }
);
