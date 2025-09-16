export interface User {
  id: number;
  email: string;
  firstName: string;
  firstLastname: string;
  roles: string[];          
  isEmailVerified: boolean;
}

export interface AuthResponse {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Roles como union type
export type UserRole = 
  | 'super_admin'
  | 'general_admin'
  | 'fair_admin'
  | 'content_admin'
  | 'auditor'
  | 'entrepreneur'
  | 'volunteer';

// Helper object para usar como enum
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  GENERAL_ADMIN: 'general_admin',
  FAIR_ADMIN: 'fair_admin',
  CONTENT_ADMIN: 'content_admin',
  AUDITOR: 'auditor',
  ENTREPRENEUR: 'entrepreneur',
  VOLUNTEER: 'volunteer'
} as const;

export const isAdmin = (user: User): boolean => {
  const adminRoles: UserRole[] = [
    'super_admin',
    'general_admin', 
    'fair_admin',
    'content_admin'
  ];
  return user.roles.some(role => adminRoles.includes(role as UserRole));
};

export const hasPermissionInUser = (user: User, requiredRoles: UserRole[]): boolean => {
  return user.roles.some(role => requiredRoles.includes(role as UserRole));
};

export const getRoleLevel = (user: User): number => {
  const levels: Record<UserRole, number> = {
    'super_admin': 7,
    'general_admin': 6,
    'fair_admin': 5,
    'content_admin': 4,
    'auditor': 3,
    'entrepreneur': 2,
    'volunteer': 1
  };
  
  // Retornar el nivel más alto de todos los roles del usuario
  return Math.max(...user.roles.map(role => levels[role as UserRole] || 0));
};