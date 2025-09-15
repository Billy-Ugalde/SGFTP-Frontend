import authClient from './authClient';
import type { LoginCredentials, AuthResponse, User } from '../types/auth.types';
import { queryClient } from '../../../main';
import { AUTH_KEYS } from '../hooks/useAuthQueries';

export const authService = {
  // Login con cookies
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await authClient.post('/auth/login', credentials);
    queryClient.setQueryData(AUTH_KEYS.user, response.data.user);
    return {
      user: response.data.user,
    };
  },

  // Verificar autenticación actual
  async checkAuth(): Promise<User> {
    const response = await authClient.get('/auth/profile');
    return response.data.user;
  },

  // Refresh token
  async refreshToken(): Promise<void> {
    await authClient.post('/auth/refresh');
  },

  // Logout
  async logout(): Promise<void> {
    await authClient.post('/auth/logout');
  },

  // Verificar token (para guards)
  async verifyToken(): Promise<{ valid: boolean; user: User }> {
    const response = await authClient.get('/auth/verify-token');
    return response.data;
  }
};