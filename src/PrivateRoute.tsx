import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './Modules/Auth/context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Cargando...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;