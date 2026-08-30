import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  /** Set to true if this route is for customers only (admin should be redirected to their dashboard) */
  customerOnly?: boolean;
  /** Specific RBSC permission required to view this administrative page */
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  customerOnly = false,
  requiredPermission,
}) => {
  const { isAuthenticated, isAdmin, user } = useAuthStore();
  const location = useLocation();

  // Handle permission toasts in side effect with unique deduplication IDs
  React.useEffect(() => {
    if (isAuthenticated && adminOnly && !isAdmin) {
      toast.error("Access Denied: Admin staff privileges required.", { id: 'admin-privilege-required' });
    }
  }, [isAuthenticated, adminOnly, isAdmin]);

  React.useEffect(() => {
    if (isAuthenticated && adminOnly && requiredPermission && user) {
      const isSuperAdmin = user.role === 'Super Admin' || user.roles?.includes('Super Admin');
      const userPermissions = user.effective_permissions || [];
      const hasPerm = isSuperAdmin || userPermissions.includes(requiredPermission);

      if (!hasPerm) {
        toast.error(`Access Denied: Account lacks required '${requiredPermission}' RBSC permission.`, {
          id: `rbsc-denied-${requiredPermission}`,
        });
      }
    }
  }, [isAuthenticated, adminOnly, requiredPermission, user]);

  // Not logged in at all — redirect to appropriate login page
  if (!isAuthenticated) {
    if (adminOnly || location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Non-admin trying to access an admin-only route — access denied
  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Granular RBSC permission check for staff routes
  if (adminOnly && requiredPermission && user) {
    const isSuperAdmin = user.role === 'Super Admin' || user.roles?.includes('Super Admin');
    const userPermissions = user.effective_permissions || [];
    const hasPerm = isSuperAdmin || userPermissions.includes(requiredPermission);

    if (!hasPerm) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Admin trying to access customer-only transactional routes (orders, checkout, profile, diagnose, planner)
  if (!adminOnly && isAdmin && !customerOnly) {
    const customerOnlyPaths = ['/orders', '/checkout', '/profile', '/diagnose', '/planner'];
    const isCustomerOnlyPath = customerOnlyPaths.some(path => location.pathname.startsWith(path));
    if (isCustomerOnlyPath) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
