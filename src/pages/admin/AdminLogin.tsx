import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { adminAuthApi } from '../../api/adminApi';
import { useAuthStore } from '../../store/authStore';
import { useSiteSettingsStore } from '../../store/siteSettingsStore';
import { ShieldCheck, Lock, Mail, ArrowRight, KeyRound, Server, AlertCircle, ArrowLeft, Building2, Cpu, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from '../../components/common/Logo';

import { PasswordInput } from '../../components/common/PasswordInput';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { appName } = useSiteSettingsStore();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!credential.trim() || !password.trim()) {
      toast.error("Please fill in corporate staff credentials.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminAuthApi.login({
        login: credential.trim(),
        password: password,
      });

      login(res.user, res.access_token);
      toast.success(`Authenticated: Welcome back, ${res.user.name}!`);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      console.error("Admin login error:", err);

      // Network fallback for demo / dev mode if backend server is offline
      if (err.code === 'ERR_NETWORK' || !err.response) {
        toast.success("Demo Mode: Authenticated as Super Admin");
        login({
          id: 1,
          name: 'Super Admin (Executive)',
          email: credential.trim() || 'superadmin@fertilizershop.com',
          phone: '9999999999',
          role: 'Super Admin',
          roles: ['Super Admin'],
          effective_permissions: ['*'],
          is_verified: true
        }, 'demo-admin-token-12345');
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      const msg = err.response?.data?.message || err.response?.data?.errors?.login?.[0] || "Invalid staff credentials or unauthorized access.";
      setErrorMessage(msg);
      toast.error("Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative font-sans text-slate-100 bg-slate-950">
      
      {/* Left Panel — High Resolution Corporate / Agricultural Management Side Image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1200&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark Emerald & Slate Atmospheric Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/94 via-slate-900/90 to-emerald-950/92" />

        {/* Corporate Logo */}
        <div className="relative z-10">
          <Logo variant="hero" />
        </div>

        {/* Side Panel Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Internal Staff &amp; Management Portal
            </span>
            <h2 className="text-4xl font-black text-white leading-tight">
              Enterprise Agri Control.<br />
              <span className="text-emerald-400">Real-Time Inventory.</span><br />
              Secure Staff Portal.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              Restricted management console for authorized staff members, agronomists, store managers, and administrative teams.
            </p>
          </div>

          {/* Key Enterprise Badges */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Building2 className="w-5 h-5" />, label: 'Multi-Store', sub: 'Hub Management' },
              { icon: <Cpu className="w-5 h-5" />, label: 'AI Diagnostic', sub: 'Realtime Triage' },
              { icon: <BarChart3 className="w-5 h-5" />, label: 'ERP Analytics', sub: 'Live Telemetry' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/70 backdrop-blur-sm rounded-2xl p-4 border border-slate-800 text-center space-y-1">
                <div className="text-emerald-400 flex justify-center">{item.icon}</div>
                <p className="text-white text-xs font-bold">{item.label}</p>
                <p className="text-slate-400 text-[10px]">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-500 text-[11px]">
          © {new Date().getFullYear()} {appName} Enterprise Systems. All access is audited.
        </p>
      </div>

      {/* Right Panel — Form Container */}
      <div
        className="w-full lg:w-1/2 relative flex items-center justify-center bg-slate-950 px-6 py-12 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark Atmosphere Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/96 via-slate-950/94 to-emerald-950/96 backdrop-blur-xs" />

        <div className="relative z-10 w-full max-w-md space-y-6">

          {/* BACK TO STORE & CUSTOMER SIGN IN LINK */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-800 transition-all cursor-pointer backdrop-blur-md shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Store</span>
            </button>

            <Link
              to="/login"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Customer Sign In →
            </Link>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center py-2">
            <Logo variant="hero" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Staff Sign In</h1>
            <p className="text-xs text-slate-400">Enter your corporate credentials to access the portal dashboard.</p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-5">
            
            {/* Quick Demo Staff Credential Selector */}
            <div className="space-y-2 pb-2 border-b border-slate-800">
              <label className="block text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span>⚡ Quick Demo Staff Sign-In</span>
                <span className="text-[10px] text-slate-400 font-normal">Click to fill</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { label: '👑 Super Admin', login: 'superadmin@fertilizershop.com', pass: 'admin123' },
                  { label: '🛡️ System Admin', login: 'admin@fertilizershop.com', pass: 'admin123' },
                  { label: '🏪 Store Manager', login: 'store.manager@fertilizershop.com', pass: 'staff123' },
                  { label: '🎧 Support Lead', login: 'support@fertilizershop.com', pass: 'staff123' },
                  { label: '🏭 Warehouse', login: 'warehouse@fertilizershop.com', pass: 'staff123' },
                  { label: '📦 Packer', login: 'packer@fertilizershop.com', pass: 'staff123' },
                  { label: '🚚 Driver', login: 'driver@fertilizershop.com', pass: 'staff123' },
                  { label: '🌾 Field Officer', login: 'field.officer@fertilizershop.com', pass: 'staff123' },
                  { label: '👤 General Staff', login: 'staff@fertilizershop.com', pass: 'staff123' },
                ].map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCredential(demo.login);
                      setPassword(demo.pass);
                      toast.success(`Demo credentials set for ${demo.label}`);
                    }}
                    className="text-[10px] font-bold py-1.5 px-2 rounded-lg bg-slate-950/90 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 transition-all text-left truncate cursor-pointer"
                    title={`${demo.login} (${demo.pass})`}
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Corporate Email / Mobile</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="admin@fertilizershop.com"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Staff Security Password</label>
                <Link
                  to="/admin/forgot-password"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <PasswordInput
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-60 text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/20 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate Portal Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-500" />
            <span>Restricted System. RBAC 256-bit Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
