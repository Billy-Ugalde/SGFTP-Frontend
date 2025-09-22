import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { LoginCredentials } from '../types/auth.types';

// Query keys
export const AUTH_KEYS = {
  user: ['auth', 'user'] as const,
  verify: ['auth', 'verify'] as const,
};

// Hook para verificar autenticación
export const useAuthQuery = () => {
  return useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: authService.checkAuth,
    retry: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: true, // ← CAMBIAR A true
  });
};

// Hook para login
export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.user, data.user);
    },
    onError: (error) => {
      //limpiar cache en caso de error
      queryClient.removeQueries({ queryKey: AUTH_KEYS.user });
      
    },
  });
};

// Hook para logout
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Limpiar todo el cache de autenticación
      queryClient.removeQueries({ queryKey: AUTH_KEYS.user });
      queryClient.clear(); // Limpiar todo el cache
    },
  });
};

// Hook para refresh token
export const useRefreshMutation = () => {
  return useMutation({
    mutationFn: authService.refreshToken,
    retry: 1,
  });
};