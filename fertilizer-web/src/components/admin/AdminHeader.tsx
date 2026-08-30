import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell, Search, Menu, Sparkles, Shield, PanelLeftClose, PanelLeftOpen,
  Sun, Moon, Plus, ChevronDown, Check, AlertTriangle, ShoppingBag,
  Package, User, Key, ExternalLink, LogOut, Command, X, Activity,
  Database, Lock, Clock, Sliders, ArrowRight, UserCheck, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Logo } from '../common/Logo';
import { adminAuthApi } from '../../api/adminApi';

interface AdminHeaderProps {
  title?: string;
  onOpenMobileSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title = "Admin Portal",
  onOpenMobileSidebar
}) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const navigate = useNavigate();

  // Dropdown states
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for click outside
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fallback notifications state
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Low Stock Warning',
      message: 'Bio-Vita Kelp Booster is down to 4 units in main warehouse.',
      time: '10 mins ago',
      type: 'warning',
      unread: true,
      link: '/admin/inventory'
    },
    {
      id: '2',
      title: 'New High-Value Order',
      message: 'Order #ORD-761923 (₹1,012) received from Sukhwinder Singh.',
      time: '25 mins ago',
      type: 'order',
      unread: true,
      link: '/admin/orders'
    },
    {
      id: '3',
      title: 'Crop Scan Review Ready',
      message: 'Farmer Ramesh submitted Paddy Leaf Blast scan for expert review.',
      time: '1 hour ago',
      type: 'system',
      unread: false,
      link: '/admin/diagnoses'
    }
  ]);

  const activeUnreadCount = notifications.filter(n => n.unread).length;

  // Handle global keyboard shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
        setQuickActionOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto focus search input on modal open
  useEffect(() => {
    if (searchModalOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchModalOpen]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(event.target as Node)) {
        setQuickActionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await adminAuthApi.logout();
    } catch (e) {
      // ignore errors
    }
    logout();
    setProfileOpen(false);
    navigate('/admin/login');
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Quick navigation items for search command palette
  const commandQuickLinks = [
    { title: 'Dashboard Overview', category: 'Pages', icon: Activity, link: '/admin/dashboard' },
    { title: 'Staff & Internal Management', category: 'Users', icon: UserCheck, link: '/admin/users' },
    { title: 'Customer & Farmer CRM', category: 'Users', icon: User, link: '/admin/customers' },
    { title: 'Product Inventory Catalog', category: 'Catalog', icon: Package, link: '/admin/products' },
    { title: 'Order Fulfillment', category: 'Sales', icon: ShoppingBag, link: '/admin/orders' },
    { title: 'Crop Diagnosis Reviews', category: 'Agri AI', icon: Sliders, link: '/admin/diagnoses' },
    { title: 'Warehouse Stock Audit', category: 'Catalog', icon: Database, link: '/admin/inventory' },
    { title: 'Role & Permission Controls', category: 'Security', icon: Key, link: '/admin/roles' },
  ];

  const filteredCommands = commandQuickLinks.filter(cmd =>
    cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className={`sticky top-0 z-30 transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-slate-950/85 border-b border-slate-800/80 text-white shadow-xl shadow-black/20 backdrop-blur-2xl'
          : 'bg-white/90 border-b border-slate-200 text-slate-900 shadow-sm backdrop-blur-2xl'
      }`}>
        {/* Top Accent Gradient Bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 via-cyan-500 to-emerald-600 animate-gradient" />

        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* LEFT SECTION: Mobile Hamburger, Logo, Title & Live Status */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={onOpenMobileSidebar}
              className={`lg:hidden p-2 rounded-xl transition-all duration-200 border cursor-pointer ${
                theme === 'dark'
                  ? 'text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border-slate-800'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
              }`}
              aria-label="Open Mobile Drawer Menu"
              title="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand Icon */}
            <div className="lg:hidden shrink-0">
              <Logo variant="icon" size="sm" />
            </div>

            {/* Live System Status Badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 uppercase tracking-wider shadow-xs shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute" />
                <span className="ml-2">Live System</span>
              </span>
            </div>
          </div>

          {/* CENTER SECTION: Quick Search Trigger Command Button */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <button
              onClick={() => setSearchModalOpen(true)}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs border transition-all duration-200 cursor-pointer group shadow-inner ${
                theme === 'dark'
                  ? 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-emerald-500/50 hover:bg-slate-900 hover:text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-emerald-500/50 hover:bg-white hover:text-slate-900 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <span className="truncate">Search orders, SKUs, farmers...</span>
              </div>
              <div className={`hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-400'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </button>
          </div>

          {/* RIGHT SECTION: Actions, Notifications, Theme Toggle, Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Mobile Search Icon Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className={`md:hidden p-2 rounded-xl border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'text-slate-300 hover:text-white bg-slate-900/60 border-slate-800'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200'
              }`}
              title="Search System"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Quick Action Dropdown Trigger (+ New) */}
            <div className="relative" ref={quickActionRef}>
              <button
                onClick={() => setQuickActionOpen(!quickActionOpen)}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-md border ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-500/30 shadow-emerald-950/40'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/40 shadow-emerald-600/20'
                }`}
                title="Quick Creation Actions"
              >
                <Plus className="w-4 h-4" />
                <span>Action</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${quickActionOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Quick Action Dropdown */}
              {quickActionOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  theme === 'dark'
                    ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-xl shadow-black/80'
                    : 'bg-white border-slate-200 text-slate-900 shadow-xl'
                }`}>
                  <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-emerald-500 border-b border-slate-800/60 dark:border-slate-800">
                    Quick Admin Shortcuts
                  </div>
                  <div className="py-1 space-y-0.5">
                    <Link
                      to="/admin/products/new"
                      onClick={() => setQuickActionOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Package className="w-4 h-4 text-emerald-500" />
                      <span>Add New Product SKU</span>
                    </Link>
                    <Link
                      to="/admin/coupons"
                      onClick={() => setQuickActionOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      <span>Create Discount Coupon</span>
                    </Link>
                    <Link
                      to="/admin/users"
                      onClick={() => setQuickActionOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      <span>Invite Staff Member</span>
                    </Link>
                    <Link
                      to="/admin/analytics"
                      onClick={() => setQuickActionOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Activity className="w-4 h-4 text-indigo-400" />
                      <span>Run Revenue Audit</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border ${
                theme === 'dark'
                  ? 'text-amber-400 hover:text-amber-300 bg-slate-900/60 hover:bg-slate-800 border-slate-800'
                  : 'text-amber-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 border-slate-200'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-amber-600 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                  theme === 'dark'
                    ? 'text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border-slate-800'
                    : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
                }`}
                title="System Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {activeUnreadCount > 0 && (
                  <>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-slate-950" />
                  </>
                )}
              </button>

              {/* Notification Center Popover */}
              {notificationsOpen && (
                <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  theme === 'dark'
                    ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-xl shadow-black/80'
                    : 'bg-white border-slate-200 text-slate-900 shadow-xl'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">System Notifications</h3>
                      {activeUnreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                          {activeUnreadCount} New
                        </span>
                      )}
                    </div>
                    {activeUnreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] font-bold text-emerald-500 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="py-2 divide-y divide-slate-800/50 max-h-72 overflow-y-auto">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate(item.link);
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-start gap-3 my-1 ${
                          item.unread
                            ? theme === 'dark' ? 'bg-slate-800/60' : 'bg-emerald-50/70'
                            : theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          item.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                          item.type === 'order' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-cyan-500/10 text-cyan-500'
                        }`}>
                          {item.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                           item.type === 'order' ? <ShoppingBag className="w-4 h-4" /> :
                           <Sparkles className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold truncate">{item.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{item.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 dark:border-slate-800 text-center">
                    <button
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/admin/orders');
                      }}
                      className="text-xs font-bold text-slate-400 hover:text-emerald-500 transition-colors flex items-center justify-center gap-1.5 w-full py-1 cursor-pointer"
                    >
                      <span>View All System Activity</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Dropdown Trigger */}
            <div className="relative pl-2 border-l border-slate-800/80 dark:border-slate-800" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2.5 p-1 rounded-2xl transition-all duration-200 cursor-pointer border ${
                  theme === 'dark'
                    ? 'hover:bg-slate-900 border-slate-800/90 text-slate-200'
                    : 'hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
                title="Admin Account & Settings"
              >
                {/* Initial Badge */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white font-black flex items-center justify-center text-xs shadow-md border border-emerald-400/40 shrink-0">
                  {user?.name?.[0] || 'A'}
                </div>

                <div className="hidden lg:block text-left pr-1">
                  <div className="flex items-center gap-1">
                    <p className={`text-xs font-extrabold leading-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                      {user?.name || 'Store Admin'}
                    </p>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-[10px] text-emerald-500 font-extrabold tracking-wider uppercase leading-tight">Super Admin</p>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Admin Profile Executive Menu */}
              {profileOpen && (
                <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  theme === 'dark'
                    ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-xl shadow-black/90'
                    : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
                }`}>
                  {/* User Details Header */}
                  <div className={`p-3 rounded-xl border flex items-center gap-3 mb-2 ${
                    theme === 'dark'
                      ? 'bg-slate-950/80 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-sm shadow-md shrink-0">
                      {user?.name?.[0] || 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black truncate">{user?.name || 'Store Administrator'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@fertilizershop.com'}</p>
                      <span className="inline-block mt-1 text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                        Super Administrator
                      </span>
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="space-y-1">
                    <Link
                      to="/admin/users"
                      onClick={() => setProfileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="w-4 h-4 text-emerald-500" />
                        <span>Staff Directory</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Manage</span>
                    </Link>

                    <Link
                      to="/admin/roles"
                      onClick={() => setProfileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-teal-400" />
                        <span>Roles & Security</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Audit</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setProfileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ExternalLink className="w-4 h-4 text-cyan-400" />
                        <span>Exit to Storefront</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Public</span>
                    </Link>
                  </div>

                  {/* Logout Action */}
                  <div className="pt-2 mt-2 border-t border-slate-800/80 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 transition-all cursor-pointer border border-rose-500/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* GLOBAL SEARCH COMMAND PALETTE MODAL (Ctrl+K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-200"
            onClick={() => setSearchModalOpen(false)}
          />

          {/* Modal Container */}
          <div className={`relative w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden z-10 animate-in zoom-in-95 duration-150 ${
            theme === 'dark'
              ? 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-2xl shadow-emerald-950/20'
              : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          }`}>
            {/* Search Bar Input Header */}
            <div className="p-4 border-b border-slate-800/80 dark:border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-emerald-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search orders, staff, SKUs, inventory, or pages..."
                className={`w-full bg-transparent text-sm sm:text-base font-medium focus:outline-none placeholder-slate-500 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="p-1 rounded-lg text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline">
                  ESC
                </span>
              )}
            </div>

            {/* Command Results */}
            <div className="p-3 max-h-96 overflow-y-auto space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Quick Portal Navigation
              </div>

              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSearchModalOpen(false);
                        navigate(cmd.link);
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                        theme === 'dark'
                          ? 'hover:bg-slate-800/80 hover:text-emerald-400'
                          : 'hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{cmd.title}</p>
                          <p className="text-[10px] text-slate-400">{cmd.category}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs font-medium">
                  No system modules match "{searchQuery}". Try searching "orders" or "products".
                </div>
              )}
            </div>

            {/* Footer Hint */}
            <div className={`p-3 border-t text-[11px] text-slate-400 flex items-center justify-between px-5 ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="flex items-center gap-1.5">
                <Command className="w-3.5 h-3.5 text-emerald-500" />
                <span>Fertilizer Admin Intelligent Search</span>
              </span>
              <span>Press <b>ESC</b> to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
