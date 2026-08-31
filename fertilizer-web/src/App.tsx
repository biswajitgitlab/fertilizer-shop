import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Common Layout components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { FloatingCartBanner } from './components/cart/FloatingCartBanner';
import { ChatWidget } from './components/chat/ChatWidget';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { IdleTimer } from './components/common/IdleTimer';

import { MobileBottomNav } from './components/common/MobileBottomNav';

// Customer Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Diagnose } from './pages/Diagnose';
import { DiagnoseHistory } from './pages/DiagnoseHistory';
import { DiagnoseResult } from './pages/DiagnoseResult';
import { Planner } from './pages/Planner';
import { PlannerDetail } from './pages/PlannerDetail';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyOtp } from './pages/VerifyOtp';
import { ForgotPassword } from './pages/ForgotPassword';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminForgotPassword } from './pages/admin/AdminForgotPassword';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { Products as AdminProducts } from './pages/admin/Products';
import { ProductForm as AdminProductForm } from './pages/admin/ProductForm';
import { Orders as AdminOrders } from './pages/admin/Orders';
import { OrderDetail as AdminOrderDetail } from './pages/admin/OrderDetail';
import { Customers as AdminCustomers } from './pages/admin/Customers';
import { Diagnoses as AdminDiagnoses } from './pages/admin/Diagnoses';
import { Analytics as AdminAnalytics } from './pages/admin/Analytics';
import { Inventory as AdminInventory } from './pages/admin/Inventory';
import { Coupons as AdminCoupons } from './pages/admin/Coupons';
import { Roles as AdminRoles } from './pages/admin/Roles';
import { UsersPage as AdminUsers } from './pages/admin/Users';
import { Reports as AdminReports } from './pages/admin/Reports';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminBatches from './pages/admin/Batches';
import AdminFarmers from './pages/admin/Farmers';
import AdminSettlements from './pages/admin/Settlements';
import AdminWarehouseZones from './pages/admin/WarehouseZones';

// Error Status Pages
import { Unauthorized, Forbidden, Unprocessable, NotFound } from './pages/errors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCustomerAuthRoute = ['/login', '/register', '/verify-otp', '/forgot-password'].includes(location.pathname);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (isCustomerAuthRoute) {
    return (
      <>
        {children}
        <MobileBottomNav />
      </>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-b from-emerald-50 via-green-50/90 to-emerald-100/70 dark:from-[#022c22] dark:via-[#043427] dark:to-[#022c22] text-slate-900 dark:text-emerald-50 flex flex-col font-sans pb-24 md:pb-0 transition-colors duration-300 overflow-x-clip">
        {/* Global Fresh & Deep Leaf Decorative Glow Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/25 dark:bg-emerald-600/15 rounded-full blur-3xl pointer-events-none glow-blob" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-lime-300/30 dark:bg-teal-800/20 rounded-full blur-3xl pointer-events-none glow-blob" style={{ animationDelay: '-3s' }} />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/35 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none glow-blob" style={{ animationDelay: '-5s' }} />
        
        {/* High Quality Authentic Fern Frond Leaves Background Overlay */}
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-[0.05] dark:opacity-[0.12] mix-blend-overlay pointer-events-none z-0"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1920')` }}
        />

        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
        <CartDrawer />
        <FloatingCartBanner />
        <ChatWidget />
      </div>
      <MobileBottomNav />
    </>
  );
};

import { useCartStore } from './store/cartStore';

export function App() {
  React.useEffect(() => {
    if (localStorage.getItem('token')) {
      useCartStore.getState().syncWithServer();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 1800,
            style: {
              background: 'rgba(15, 23, 42, 0.94)',
              color: '#f8fafc',
              borderRadius: '1rem',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
              fontSize: '0.875rem',
              fontWeight: '600',
              padding: '12px 18px',
              animation: 'toast-slide-right-to-left 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
            success: {
              duration: 1800,
              iconTheme: {
                primary: '#10b981',
                secondary: '#020617',
              },
              style: {
                border: '1px solid rgba(16, 185, 129, 0.5)',
              },
            },
            error: {
              duration: 2200,
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#020617',
              },
              style: {
                border: '1px solid rgba(244, 63, 94, 0.5)',
              },
            },
          }}
        />
        <IdleTimer />
        <LayoutWrapper>
          <Routes>
            {/* Customer Storefront Routes — Public */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Customer Routes — Protected (Customer Login Required) */}
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

            {/* Diagnose — requires login */}
            <Route path="/diagnose" element={<ProtectedRoute><Diagnose /></ProtectedRoute>} />
            <Route path="/diagnose/history" element={<ProtectedRoute><DiagnoseHistory /></ProtectedRoute>} />
            <Route path="/diagnose/:id" element={<ProtectedRoute><DiagnoseResult /></ProtectedRoute>} />

            {/* Planner — requires login */}
            <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
            <Route path="/planner/:id" element={<ProtectedRoute><PlannerDetail /></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin Portal Authentication Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

            {/* Admin Routes — Internal Staff Only with RBSC Permissions */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly requiredPermission="products.view"><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/products/new" element={<ProtectedRoute adminOnly requiredPermission="products.create"><AdminProductForm /></ProtectedRoute>} />
            <Route path="/admin/products/edit/:id" element={<ProtectedRoute adminOnly requiredPermission="products.edit"><AdminProductForm /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly requiredPermission="orders.view"><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/orders/:id" element={<ProtectedRoute adminOnly requiredPermission="orders.view"><AdminOrderDetail /></ProtectedRoute>} />
            <Route path="/admin/customers" element={<ProtectedRoute adminOnly requiredPermission="customers.view"><AdminCustomers /></ProtectedRoute>} />
            <Route path="/admin/diagnoses" element={<ProtectedRoute adminOnly requiredPermission="crop_plans.view"><AdminDiagnoses /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute adminOnly requiredPermission="analytics.view"><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute adminOnly requiredPermission="analytics.view"><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute adminOnly requiredPermission="inventory.view"><AdminInventory /></ProtectedRoute>} />
            <Route path="/admin/coupons" element={<ProtectedRoute adminOnly requiredPermission="products.view"><AdminCoupons /></ProtectedRoute>} />
            <Route path="/admin/roles" element={<ProtectedRoute adminOnly requiredPermission="roles.view"><AdminRoles /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly requiredPermission="users.view"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute adminOnly requiredPermission="security.audit"><AdminAuditLogs /></ProtectedRoute>} />
            <Route path="/admin/batches" element={<ProtectedRoute adminOnly requiredPermission="inventory.view"><AdminBatches /></ProtectedRoute>} />
            <Route path="/admin/farmers" element={<ProtectedRoute adminOnly requiredPermission="users.view"><AdminFarmers /></ProtectedRoute>} />
            <Route path="/admin/settlements" element={<ProtectedRoute adminOnly requiredPermission="financial.reports"><AdminSettlements /></ProtectedRoute>} />
            <Route path="/admin/warehouse-zones" element={<ProtectedRoute adminOnly requiredPermission="warehouse_zones.view"><AdminWarehouseZones /></ProtectedRoute>} />

            {/* HTTP Error Status Routes */}
            <Route path="/401" element={<Unauthorized />} />
            <Route path="/403" element={<Forbidden />} />
            <Route path="/422" element={<Unprocessable />} />
            <Route path="/404" element={<NotFound />} />

            {/* Catch all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LayoutWrapper>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
