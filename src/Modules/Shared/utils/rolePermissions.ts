// Definición de los módulos disponibles para cada rol
export const ROLE_MODULES = {
  super_admin: ['ferias', 'emprendedores', 'informativo', 'donadores', 'usuarios'],
  general_admin: ['ferias', 'emprendedores', 'informativo', 'donadores'],
  fair_admin: ['ferias', 'emprendedores'],
  content_admin: ['informativo'],
  auditor: [],
} as const;

export type UserRole = keyof typeof ROLE_MODULES;
export type ModuleKey = 'ferias' | 'emprendedores' | 'informativo' | 'donadores' | 'usuarios';

/**
 * Obtiene los módulos disponibles para un rol específico
 * @param userRole - Rol del usuario
 * @returns Array de módulos disponibles
 */
export const getAvailableModules = (userRole: string): ModuleKey[] => {
    return [...(ROLE_MODULES[userRole as UserRole] || [])];
};

/**
 * Verifica si un usuario tiene acceso a un módulo específico
 * @param userRole - Rol del usuario
 * @param module - Módulo a verificar
 * @returns true si tiene acceso, false si no
 */
export const hasModuleAccess = (userRole: string, module: ModuleKey): boolean => {
  const availableModules = getAvailableModules(userRole);
  return availableModules.includes(module);
};