
import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

// Configure API base URL from environment variable or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response && response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Show toast message for server errors
    if (response && response.data && response.data.message) {
      toast({
        title: "Error",
        description: response.data.message,
        variant: "destructive",
      });
    } else if (!response) {
      // Network error
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your internet connection.",
        variant: "destructive",
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
