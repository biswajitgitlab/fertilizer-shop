import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { Sprout, User, Lock, ArrowRight, ShieldCheck, Leaf, Wheat } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await authApi.login({ credential, password });
      login(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      if (res.user.role?.toLowerCase() === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(from, { replace: true });
      }
    } catch (e) {
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Full Agricultural Background Image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-emerald-900/80 to-teal-900/85" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Sprout className="w-6 h-6 text-emerald-950" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">SarkarFertilizer</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full">
              <Leaf className="w-3.5 h-3.5" />
              Government Certified Agri Inputs
            </span>
            <h2 className="text-4xl font-black text-white leading-tight">
              Grow More.<br />
              <span className="text-emerald-400">Spend Less.</span><br />
              Farm Smarter.
            </h2>
            <p className="text-emerald-100/80 text-sm leading-relaxed max-w-sm">
              India's trusted fertilizer marketplace. Genuine NPK, organic inputs, pesticides &amp; certified seeds — delivered to your farm doorstep.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <ShieldCheck className="w-5 h-5" />, label: '100% Genuine', sub: 'Govt Verified' },
              { icon: <Wheat className="w-5 h-5" />, label: '50K+ Farmers', sub: 'Trust Us' },
              { icon: <Leaf className="w-5 h-5" />, label: 'Organic Range', sub: 'Available' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center space-y-1">
                <div className="text-emerald-400 flex justify-center">{item.icon}</div>
                <p className="text-white text-xs font-bold">{item.label}</p>
                <p className="text-emerald-300 text-[10px]">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-emerald-400/60 text-[10px]">
          © 2024 SarkarFertilizer. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 mb-3">
              <Sprout className="w-8 h-8" />
            </div>
            <p className="text-xs font-bold text-emerald-700">SarkarFertilizer</p>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900">Welcome back 👋</h1>
            <p className="text-sm text-gray-500">Sign in to access your account and farm dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Email or Mobile Number</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Enter email or 10-digit mobile..."
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="Enter your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer">
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-200 cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
              New to SarkarFertilizer?{' '}
              <Link to="/register" className="font-bold text-emerald-700 hover:underline">
                Create Free Account
              </Link>
            </div>
          </form>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 text-[10px] text-gray-400 font-semibold">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure Login</span>
            <span className="flex items-center gap-1"><Leaf className="w-3 h-3 text-emerald-500" /> 50,000+ Farmers</span>
            <span className="flex items-center gap-1"><Wheat className="w-3 h-3 text-emerald-500" /> Govt Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
