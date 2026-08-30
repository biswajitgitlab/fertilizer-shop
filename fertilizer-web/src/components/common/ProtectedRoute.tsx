import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  /** Set to true if this route is for customers only (admin should be redirected to their dashboard) */
  customerOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  customerOnly = false,
}) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const location = useLocation();

  // Not logged in at all — redirect to appropriate login page
  if (!isAuthenticated) {
    if (adminOnly || location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Non-admin trying to access an admin-only route — access denied
  if (adminOnly && !isAdmin) {
    toast.error("Access Denied: Admin staff privileges required.");
    return <Navigate to="/admin/login" replace />;
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
