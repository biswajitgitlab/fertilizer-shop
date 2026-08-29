import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sprout, Search, ShoppingBag, User, Globe, Menu, X,
  ShieldCheck, LogOut, Package, Calendar, Stethoscope, ChevronDown, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useUIStore } from '../../store/uiStore';
import { useTranslation } from 'react-i18next';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, toggleDrawer } = useCart();
  const { language, setLanguage } = useUIStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
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
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">Government Certified Genuine Agricultural Inputs &amp; Direct Farm Delivery</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span>Toll Free Helpline: 1800-888-FARM</span>
            <button
              onClick={handleLanguageToggle}
              className="flex items-center gap-1.5 hover:text-white font-medium cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'हिंदी (Hindi)' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="SarkarFertilizer Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900 flex items-center">
                Sarkar<span className="text-emerald-600">Fertilizer</span>
              </span>
              {isAdmin ? (
                <span className="text-[10px] block font-semibold text-amber-600 uppercase tracking-wider -mt-1">
                  Admin Portal
                </span>
              ) : (
                <span className="text-[10px] block font-semibold text-emerald-700 uppercase tracking-wider -mt-1">
                  Fertilizers &amp; Agri Store
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Search — only for non-admin */}
          {!isAdmin && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </form>
          )}

          {/* Admin banner in navbar */}
          {isAdmin && (
            <div className="hidden md:flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
              <span>Administrator Mode</span>
            </div>
          )}

          {/* Desktop Navigation — only for non-admin */}
          {!isAdmin && (
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link
                to="/"
                className={`transition-colors hover:text-emerald-600 ${isActive('/') ? 'text-emerald-600 font-bold' : ''}`}
              >
                {t('nav_home')}
              </Link>
              <Link
                to="/products"
                className={`transition-colors hover:text-emerald-600 ${isActive('/products') ? 'text-emerald-600 font-bold' : ''}`}
              >
                {t('nav_products')}
              </Link>
              <Link
                to="/diagnose"
                className={`flex items-center gap-1 transition-colors hover:text-emerald-600 ${isActive('/diagnose') ? 'text-emerald-600 font-bold' : ''}`}
              >
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>{t('nav_diagnose')}</span>
              </Link>
              <Link
                to="/planner"
                className={`flex items-center gap-1 transition-colors hover:text-emerald-600 ${isActive('/planner') ? 'text-emerald-600 font-bold' : ''}`}
              >
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>{t('nav_planner')}</span>
              </Link>
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language button mobile — only for non-admin */}
            {!isAdmin && (
              <button
                onClick={handleLanguageToggle}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <Globe className="w-5 h-5" />
              </button>
            )}

            {/* Cart Button — only for non-admin */}
            {!isAdmin && (
              <button
                onClick={toggleDrawer}
                className="relative p-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors cursor-pointer"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-scale-in">
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth Dropdown / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm border ${isAdmin ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
                    {user?.name?.[0] || 'F'}
                  </div>
                  <span className="hidden md:inline text-sm font-semibold text-gray-800 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden md:inline" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.phone || user?.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          Administrator
                        </span>
                      )}
                    </div>

                    {/* Admin sees ONLY admin dashboard link */}
                    {isAdmin ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-700 font-semibold hover:bg-amber-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    ) : (
                      /* Customer-only links */
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{t('nav_profile')}</span>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-400" />
                          <span>{t('nav_orders')}</span>
                        </Link>

                        <Link
                          to="/diagnose"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          <span>Crop Diagnosis</span>
                        </Link>

                        <Link
                          to="/planner"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Farm Planner</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
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
                className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-200"
              >
                {t('nav_login')}
              </Link>
            )}

            {/* Mobile Hamburger Toggle — only for non-admin */}
            {!isAdmin && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer — only for non-admin */}
        {!isAdmin && mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 space-y-4 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </form>

            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {t('nav_home')}
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {t('nav_products')}
              </Link>
              <Link
                to="/diagnose"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-700 hover:bg-emerald-50"
              >
                {t('nav_diagnose')}
              </Link>
              <Link
                to="/planner"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-amber-700 hover:bg-amber-50"
              >
                {t('nav_planner')}
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
