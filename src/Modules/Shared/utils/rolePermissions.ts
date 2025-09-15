// Definición de los módulos disponibles para cada rol
export const ROLE_MODULES = {
  super_admin: ['ferias', 'emprendedores', 'informativo', 'donadores', 'usuarios'],
  general_admin: ['ferias', 'emprendedores', 'informativo', 'donadores'],
  fair_admin: ['ferias', 'emprendedores'],
  content_admin: ['informativo'],
  auditor: [], // Solo lectura, sin acceso a dashboard admin
  entrepreneur: [],
  volunteer: []
} as const;

export type UserRole = keyof typeof ROLE_MODULES;
export type ModuleKey = 'ferias' | 'emprendedores' | 'informativo' | 'donadores' | 'usuarios';

/**
 * Obtiene los módulos disponibles para múltiples roles
 * @param userRoles - Array de roles del usuario
 * @returns Array de módulos disponibles (sin duplicados)
 */
export const getAvailableModules = (userRoles: string[]): ModuleKey[] => {
  const allModules = new Set<ModuleKey>();
  
  userRoles.forEach(role => {
    const modules = ROLE_MODULES[role as UserRole] || [];
    modules.forEach(module => allModules.add(module));
  });
  
  return Array.from(allModules);
};

/**
 * Verifica si un usuario tiene acceso a un módulo específico
 * @param userRoles - Array de roles del usuario
 * @param module - Módulo a verificar
 * @returns true si tiene acceso, false si no
 */
export const hasModuleAccess = (userRoles: string[], module: ModuleKey): boolean => {
  const availableModules = getAvailableModules(userRoles);
  return availableModules.includes(module);
};

/**
 * Función legacy para compatibilidad (rol único)
 * @deprecated Usar getAvailableModules con array de roles
 */
export const getAvailableModulesSingleRole = (userRole: string): ModuleKey[] => {
  return getAvailableModules([userRole]);
};