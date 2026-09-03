import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, User, Globe, Menu, X,
  LogOut, Package, Calendar, Stethoscope, ChevronDown, LayoutDashboard, Sun, Moon, Sprout,
  Bell, CheckCheck, Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useUIStore } from '../../store/uiStore';
import { useTranslation } from 'react-i18next';
import {
  AnimatedLeaf,
  AnimatedCart,
  AnimatedShield,
  AnimatedSparkles,
  AnimatedSearch
} from './AnimatedIcons';
import { productApi } from '../../api/productApi';
import { userNotificationApi, UserNotification } from '../../api/userNotificationApi';
import { echo } from '../../utils/echo';
import { Logo } from './Logo';
import { TopCouponMarquee } from './TopCouponMarquee';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, toggleDrawer } = useCart();
  const { language, setLanguage, theme, toggleTheme } = useUIStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [notifFilter, setNotifFilter] = useState<'unread' | 'all'>('unread');

  const fetchNotifications = async () => {
    if (!isAuthenticated || isAdmin) return;
    const res = await userNotificationApi.getNotifications();
    setNotifications(Array.isArray(res.notifications) ? res.notifications : []);
    setUnreadCount(typeof res.unread_count === 'number' ? res.unread_count : 0);
  };

  useEffect(() => {
    fetchNotifications();

    if (isAuthenticated && !isAdmin) {
      const channel = echo.channel('admin-orders');
      channel.listen('.OrderStatusUpdated', () => {
        fetchNotifications();
      });

      return () => {
        channel.stopListening('.OrderStatusUpdated');
        echo.leaveChannel('admin-orders');
      };
    }
  }, [isAuthenticated, isAdmin]);

  const handleMarkAllRead = async () => {
    await userNotificationApi.markAllAsRead();
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = async (notif: UserNotification) => {
    if (notif.unread) {
      await userNotificationApi.markAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifDropdownOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const displayedNotifications = notifFilter === 'unread'
    ? safeNotifications.filter(n => n.unread)
    : safeNotifications;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      productApi.trackSearch(q);
      navigate(`/products?search=${encodeURIComponent(q)}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLanguageToggle = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-xs transition-colors duration-300">
      {/* Top Banner */}
      <div className="bg-emerald-900 dark:bg-slate-950 text-emerald-100 text-xs py-1.5 px-3 sm:px-6 lg:px-12 border-b border-emerald-800/40 dark:border-slate-800">
        <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <AnimatedShield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs truncate">
              <span className="sm:hidden">Govt. Certified Agri Store &amp; Direct Delivery</span>
              <span className="hidden sm:inline">Government Certified Genuine Agricultural Inputs &amp; Direct Farm Delivery</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden md:inline text-xs text-emerald-200 dark:text-slate-400">Toll Free: 1800-888-FARM</span>
            
            {/* Dark / Light Theme Toggle Switch */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="flex items-center gap-1.5 font-semibold text-[11px] sm:text-xs cursor-pointer bg-emerald-800/80 dark:bg-slate-800 text-amber-300 dark:text-amber-400 hover:text-white px-2.5 py-1 rounded-lg border border-emerald-700/50 dark:border-slate-700 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-amber-300" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={handleLanguageToggle}
              className="flex items-center gap-1 hover:text-white font-semibold text-[11px] sm:text-xs cursor-pointer bg-emerald-800/80 dark:bg-slate-800 text-emerald-200 dark:text-slate-300 px-2 py-0.5 rounded-md border border-emerald-700/50 dark:border-slate-700"
            >
              <Globe className="w-3 h-3 text-emerald-300" />
              <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo */}
          <Link to={isAdmin ? '/admin/dashboard' : '/'} className="shrink-0 transition-transform duration-200 hover:scale-[1.02]">
            <Logo variant="navbar" isAdmin={isAdmin} />
          </Link>

          {/* Desktop Search — only for non-admin */}
          {!isAdmin && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <div className="absolute left-3.5 top-2.5">
                <AnimatedSearch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </form>
          )}

          {/* Admin banner in navbar */}
          {isAdmin && (
            <div className="hidden md:flex items-center gap-2 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl">
              <AnimatedShield className="w-4 h-4 text-amber-600" />
              <span>Administrator Mode</span>
            </div>
          )}

          {/* Desktop Navigation — only for non-admin */}
          {!isAdmin && (
            <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
              <Link
                to="/"
                className={`transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  isActive('/') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-slate-300'
                }`}
              >
                {t('nav_home')}
              </Link>
              <Link
                to="/products"
                className={`transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  isActive('/products') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-slate-300'
                }`}
              >
                {t('nav_products')}
              </Link>
              <Link
                to="/diagnose"
                className={`flex items-center gap-1 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  isActive('/diagnose') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-slate-300'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>{t('nav_diagnose')}</span>
              </Link>
              <Link
                to="/planner"
                className={`flex items-center gap-1 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  isActive('/planner') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-slate-300'
                }`}
              >
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t('nav_planner')}</span>
              </Link>
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

            {/* Cart Button — only for non-admin */}
            {!isAdmin && (
              <motion.button
                onClick={toggleDrawer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-gray-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                aria-label="View Cart"
              >
                <AnimatedCart className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 dark:text-emerald-400" active={itemCount > 0} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}

            {/* Notification Bell Button — only for logged-in non-admin */}
            {isAuthenticated && !isAdmin && (
              <div className="relative">
                <motion.button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 text-gray-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="View Notifications"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 dark:text-emerald-400" />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {notifDropdownOpen && (
                  <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 py-3 z-50 animate-fade-in text-gray-900 dark:text-white">
                    <div className="px-4 pb-2 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex border-b border-gray-100 dark:border-slate-800 px-3 py-1.5 gap-2 bg-gray-50/50 dark:bg-slate-800/40">
                      <button
                        onClick={() => setNotifFilter('unread')}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          notifFilter === 'unread'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-gray-600 dark:text-slate-400 hover:bg-gray-200/60 dark:hover:bg-slate-800'
                        }`}
                      >
                        Unread ({unreadCount})
                      </button>
                      <button
                        onClick={() => setNotifFilter('all')}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          notifFilter === 'all'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-gray-600 dark:text-slate-400 hover:bg-gray-200/60 dark:hover:bg-slate-800'
                        }`}
                      >
                        All ({safeNotifications.length})
                      </button>
                    </div>

                    <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/60">
                      {displayedNotifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-500 dark:text-slate-400 space-y-1">
                          <CheckCheck className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-80" />
                          <p className="font-semibold text-gray-700 dark:text-slate-300">
                            {notifFilter === 'unread' ? 'All caught up!' : 'No order notifications'}
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-slate-500">
                            {notifFilter === 'unread'
                              ? 'No unread status updates at this moment.'
                              : 'Real order status changes will appear here.'}
                          </p>
                        </div>
                      ) : (
                        displayedNotifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/70 flex gap-3 items-start ${
                              n.unread ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-semibold' : ''
                            }`}
                          >
                            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
                              <Package className="w-4 h-4" />
                            </div>
                            <div className="flex-1 space-y-1 text-xs">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-bold text-gray-900 dark:text-white leading-tight">{n.title}</p>
                                {n.unread && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                              </div>
                              <p className="text-gray-600 dark:text-slate-300 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center gap-1 pt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{n.time}</span>
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Dropdown / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold flex items-center justify-center text-xs sm:text-sm border ${
                    isAdmin
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  }`}>
                    {user?.name?.[0] || 'F'}
                  </div>
                  <span className="hidden md:inline text-sm font-semibold text-gray-800 dark:text-slate-200 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-400 hidden md:inline" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50 animate-fade-in text-gray-900 dark:text-white">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                      <p className="text-xs text-gray-400 dark:text-slate-400 font-medium">Logged in as</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{user?.phone || user?.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <AnimatedShield size={12} className="text-amber-500" />
                          Administrator
                        </span>
                      )}
                    </div>

                    {/* Admin sees ONLY admin dashboard link */}
                    {isAdmin ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-300 font-semibold hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    ) : (
                      /* Customer-only links */
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                          <span>{t('nav_profile')}</span>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                          <span>{t('nav_orders')}</span>
                        </Link>

                        <Link
                          to="/diagnose"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Stethoscope className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                          <span>Crop Diagnosis</span>
                        </Link>

                        <Link
                          to="/planner"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                          <span>Farm Planner</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-emerald-200 dark:shadow-none shrink-0"
              >
                {t('nav_login')}
              </Link>
            )}

            {/* Mobile Hamburger Toggle — only for non-admin */}
            {!isAdmin && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer — only for non-admin */}
        {!isAdmin && mobileMenuOpen && (
          <div className="lg:hidden border-b border-emerald-500/20 py-4 px-4 space-y-3 animate-fade-in bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl text-gray-900 dark:text-white shadow-2xl rounded-b-3xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
              <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-3" />
            </form>

            <div className="space-y-1.5">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 hover:text-emerald-700 dark:hover:text-emerald-400 border border-transparent hover:border-emerald-200/50 transition-all"
              >
                <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('nav_home')}</span>
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 hover:text-emerald-700 dark:hover:text-emerald-400 border border-transparent hover:border-emerald-200/50 transition-all"
              >
                <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('nav_products')}</span>
              </Link>
              <Link
                to="/diagnose"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/20 shadow-xs"
              >
                <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>AI Crop Doctor &amp; Diagnosis</span>
              </Link>
              <Link
                to="/planner"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-950/60 border border-amber-500/20 shadow-xs"
              >
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Farm Crop Planner</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all"
                  >
                    <User className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </button>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all"
                  >
                    <Package className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                    <span>My Orders</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div className="pt-2 flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 font-bold py-2.5 rounded-2xl text-xs border border-gray-200 dark:border-slate-700 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
    </>
  );
};
