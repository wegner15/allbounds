import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperuser?: boolean;
  requireRole?: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireSuperuser = false,
  requireRole
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-charcoal"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If superuser is required but user is not a superuser
  if (requireSuperuser && !user?.is_superuser) {
    // If user has the finance role, redirect smoothly to finance section
    if (user?.roles?.some(r => r.name === 'finance')) {
      return <Navigate to="/admin/finance" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // If a specific role is required (superusers always bypass)
  if (requireRole && !user?.is_superuser) {
    const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
    const userRoleNames = user?.roles?.map(r => r.name) || [];
    const hasRequiredRole = roles.some(role => userRoleNames.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has proper permissions
  return <>{children}</>;
};

export default ProtectedRoute;
