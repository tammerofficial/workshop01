import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [],
  requiredPermissions = [],
  allowedRoles = []
}) => {
  // Add error handling for AuthContext
  let isAuthenticated = false;
  let loading = true;
  let hasAnyRole = () => false;
  let hasAnyPermission = () => false;
  
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
    loading = auth.loading;
    
    const permissions = usePermissions();
    hasAnyRole = permissions.hasAnyRole;
    hasAnyPermission = permissions.hasAnyPermission;
  } catch (error) {
    console.error('Auth context not available, redirecting to login:', error);
    // If AuthContext is not available, redirect to login
    return <Navigate to="/login" replace />;
  }
  
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permissions first
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check roles (legacy support)
  const rolesToCheck = [...requiredRoles, ...allowedRoles];
  if (rolesToCheck.length > 0 && !hasAnyRole(rolesToCheck)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;