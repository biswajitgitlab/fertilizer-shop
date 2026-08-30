import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Common Layout components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ChatWidget } from './components/chat/ChatWidget';
import { ProtectedRoute } from './components/common/ProtectedRoute';

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

// Admin Pages
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
  const isAuthRoute = ['/login', '/register', '/verify-otp'].includes(location.pathname);

  if (isAdminRoute || isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-emerald-50/90 via-teal-50/50 to-green-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-0 transition-colors duration-300 overflow-x-hidden">
      {/* Global Light-Green Decorative Glow Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/30 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none glow-blob" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-teal-300/25 dark:bg-teal-900/10 rounded-full blur-3xl pointer-events-none glow-blob" style={{ animationDelay: '-3s' }} />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-lime-200/35 dark:bg-emerald-950/15 rounded-full blur-3xl pointer-events-none glow-blob" style={{ animationDelay: '-5s' }} />
      
      {/* Geometric Ambient Dots */}
      <div className="planner-grid-pattern absolute inset-0 opacity-[0.14] dark:opacity-[0.03] pointer-events-none" />

      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
      <MobileBottomNav />
    </div>
  );
};



export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <LayoutWrapper>
          <Routes>
            {/* Customer Routes — Public */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            {/* Customer Routes — Protected (Login Required) */}
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

            {/* Diagnose — requires login to submit */}
            <Route path="/diagnose" element={<ProtectedRoute><Diagnose /></ProtectedRoute>} />
            <Route path="/diagnose/history" element={<ProtectedRoute><DiagnoseHistory /></ProtectedRoute>} />
            <Route path="/diagnose/:id" element={<ProtectedRoute><DiagnoseResult /></ProtectedRoute>} />

            {/* Planner — requires login */}
            <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
            <Route path="/planner/:id" element={<ProtectedRoute><PlannerDetail /></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin Routes — Admin Only */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/products/new" element={<ProtectedRoute adminOnly><AdminProductForm /></ProtectedRoute>} />
            <Route path="/admin/products/edit/:id" element={<ProtectedRoute adminOnly><AdminProductForm /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/orders/:id" element={<ProtectedRoute adminOnly><AdminOrderDetail /></ProtectedRoute>} />
            <Route path="/admin/customers" element={<ProtectedRoute adminOnly><AdminCustomers /></ProtectedRoute>} />
            <Route path="/admin/diagnoses" element={<ProtectedRoute adminOnly><AdminDiagnoses /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute adminOnly><AdminInventory /></ProtectedRoute>} />
            <Route path="/admin/coupons" element={<ProtectedRoute adminOnly><AdminCoupons /></ProtectedRoute>} />
            <Route path="/admin/roles" element={<ProtectedRoute adminOnly><AdminRoles /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />

            {/* Catch all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LayoutWrapper>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
