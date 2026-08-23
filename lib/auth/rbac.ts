export type Role = 
  | 'Super Admin'
  | 'Admin'
  | 'Sales Manager'
  | 'Plant Manager'
  | 'Dispatcher'
  | 'Customer'
  | 'Contractor'
  | 'Employee'
  | 'Supplier'
  | 'HR'
  | 'Accountant';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  company: string | null;
  permissions: string[];
}

export function hasRole(user: UserSession | null, allowedRoles: Role[]): boolean {
  if (!user) return false;
  if (user.role === 'Super Admin') return true; // Super Admin has access to everything
  return allowedRoles.includes(user.role);
}

export function hasPermission(user: UserSession | null, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'Super Admin') return true;
  return user.permissions.includes(permission);
}
