
import api from './api';
import { User } from '@/types';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  role: "buyer" | "seller";
};

export type AuthResponse = {
  token: string;
  user: User;
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
  
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/auth/profile', profileData);
    return response.data;
  },
};

export default authService;
