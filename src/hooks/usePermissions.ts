import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Super Admin has all permissions
    if (user.role?.name === 'super_admin') {
      return true;
    }
    
    // Check if user has the specific permission
    if (user.permissions && user.permissions.includes(permission)) {
      return true;
    }
    
    // Check if user's role has the permission
    if (user.role && user.role.permissions && user.role.permissions.includes(permission)) {
      return true;
    }
    
    return false;
  };

  const hasRole = (role: string): boolean => {
    if (!user || !user.role) return false;
    return user.role.name === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user || !user.role) return false;
    return roles.includes(user.role.name);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Specific permission checks - only use permissions, not roles
  const canViewDashboard = (): boolean => {
    return hasPermission('dashboard.view');
  };

  const canManageOrders = (): boolean => {
    return hasAnyPermission([
      'orders.view',
      'orders.create',
      'orders.edit'
    ]);
  };

  const canManageWorkers = (): boolean => {
    return hasAnyPermission([
      'workers.view',
      'workers.manage'
    ]);
  };

  const canViewReports = (): boolean => {
    return hasAnyPermission([
      'reports.view',
      'analytics.view'
    ]);
  };

  const canManageInventory = (): boolean => {
    return hasAnyPermission([
      'inventory.view',
      'inventory.manage'
    ]);
  };

  const canAccessAdmin = (): boolean => {
    return hasAnyPermission([
      'system.admin',
      'users.manage',
      'roles.manage'
    ]) || hasAnyRole(['admin', 'system_administrator', 'super_admin']);
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAnyPermission,
    canViewDashboard,
    canManageOrders,
    canManageWorkers,
    canViewReports,
    canManageInventory,
    canAccessAdmin,
    user
  };
};