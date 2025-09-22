import type { UserRole } from '../types/auth.types';

/**
 * Verifica si un usuario tiene alguno de los permisos requeridos
 * @param userRoles - Array de roles del usuario
 * @param requiredRoles - Array de roles requeridos
 * @returns true si tiene al menos uno de los roles requeridos
 */
export const hasPermission = (userRoles: UserRole[], requiredRoles: UserRole[]): boolean => {
  // Verificar si alguno de los roles del usuario está en los requeridos
  return userRoles.some(userRole => {
    // Super admin tiene acceso a todo
    if (userRole === 'super_admin') {
      return true;
    }
    // Si está en la lista directa
    return requiredRoles.includes(userRole);
  });
};

/**
 * Función legacy para compatibilidad con rol único
 * @deprecated Usar hasPermission con array de roles
 */
export const hasPermissionSingleRole = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return hasPermission([userRole], requiredRoles);
};