import type { UserRole } from '../types/auth.types';

export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  // Si está en la lista directa
  if (requiredRoles.includes(userRole)) {
    return true;
  }
  
  // Super admin tiene acceso a todo
  if (userRole === 'super_admin') {
    return true;
  }
  
  return false;
};