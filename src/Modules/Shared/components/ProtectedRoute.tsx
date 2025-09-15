import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Auth/context/AuthContext';
import type { UserRole } from '../../Auth/types/auth.types';
import { hasPermission } from '../../Auth/utils/permissionUtils';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  fallback?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [],
  fallback = '/unauthorized' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="loading">Verificando permisos...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles.length > 0 && user) {
    // ✅ CAMBIO PRINCIPAL: Usar array de roles del usuario
    const userRoles = user.roles as UserRole[];
    if (!hasPermission(userRoles, requiredRoles)) {
      return <Navigate to={fallback} replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;