import React from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  useAuthQuery, 
  useLoginMutation, 
  useLogoutMutation 
} from '../hooks/useAuthQueries';
import type { LoginCredentials } from '../types/auth.types';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  
  // React Query hooks
  const { data: user, isLoading, error, refetch } = useAuthQuery();

  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();

  // Estado derivado
  const isAuthenticated = !!user && !error;

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      await loginMutation.mutateAsync(credentials);
      // Navegación se manejará en el componente
    } catch (error) {
      throw error; // Re-throw para manejar en el componente
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/login');
    } catch (error) {
      // Incluso si falla la API, limpiamos localmente
      navigate('/login');
    }
  };

  // Check auth function
  const checkAuth = async (): Promise<void> => {
    await refetch();
  };

  

  const contextValue = {
    user: user || null,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};