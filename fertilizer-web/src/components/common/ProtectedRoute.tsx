import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

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

  // Not logged in at all — redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin trying to access an admin-only route — allowed
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Admin trying to access customer-only routes (orders, checkout, profile, diagnose, planner)
  // Redirect them to their admin dashboard
  if (!adminOnly && isAdmin && !customerOnly) {
    // Allow "Exit to Store" for browsing products & home but block transactional pages
    const customerOnlyPaths = ['/orders', '/checkout', '/profile', '/diagnose', '/planner'];
    const isCustomerOnlyPath = customerOnlyPaths.some(path => location.pathname.startsWith(path));
    if (isCustomerOnlyPath) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
