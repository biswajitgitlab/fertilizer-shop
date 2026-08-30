import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { User, Lock, ArrowRight, ShieldCheck, Leaf, Wheat, ArrowLeft, KeyRound, CheckCircle2, Phone, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from '../components/common/Logo';

import { PasswordInput } from '../components/common/PasswordInput';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'phone' | 'otp' | 'reset'>('phone');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

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
      await useCartStore.getState().syncWithServer();
      toast.success(`Welcome back, ${res.user.name}!`);

      const rawFrom = location.state?.from?.pathname;
      const targetPath = (rawFrom === '/checkout' || rawFrom === '/cart') ? rawFrom : '/';
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      if (err.response?.status === 429) {
        toast.error("Too many login attempts! Please wait 1 minute before trying again.");
      } else {
        const errorMsg = err.response?.data?.errors?.login?.[0] || err.response?.data?.message || "Invalid credentials. Please try again.";
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone) {
      toast.error("Please enter your registered 10-digit mobile number.");
      return;
    }
    setIsForgotLoading(true);
    setTimeout(() => {
      setIsForgotLoading(false);
      setForgotStep('otp');
      toast.success("Password reset OTP sent to your mobile!");
    }, 800);
  };

  const handleVerifyResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp) {
      toast.error("Please enter the 4-digit OTP.");
      return;
    }
    setIsForgotLoading(true);
    setTimeout(() => {
      setIsForgotLoading(false);
      setForgotStep('reset');
      toast.success("OTP Verified! Enter your new password.");
    }, 800);
  };

  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    setIsForgotLoading(true);
    setTimeout(() => {
      setIsForgotLoading(false);
      setShowForgotModal(false);
      setForgotStep('phone');
      setForgotPhone('');
      setForgotOtp('');
      setNewPassword('');
      toast.success("Password reset successfully! You can now log in with your new password.");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex relative">
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
          <Logo variant="hero" />
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
      <div
        className="w-full lg:w-1/2 relative flex items-center justify-center bg-slate-950 px-6 py-12 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Atmosphere Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/94 via-slate-950/92 to-teal-950/95 backdrop-blur-xs" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 w-full max-w-md space-y-6">

          {/* BACK TO SHOP BUTTON & ADMIN PORTAL LINK */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-white bg-slate-900/80 hover:bg-emerald-900/80 px-4 py-2 rounded-xl border border-emerald-500/30 transition-all cursor-pointer backdrop-blur-md shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Store</span>
            </button>

            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-950/70 hover:bg-amber-900/80 px-3.5 py-2 rounded-xl border border-amber-500/40 transition-all backdrop-blur-md shadow-lg"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Staff Login →</span>
            </Link>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center py-2">
            <Logo variant="hero" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome back 👋</h1>
            <p className="text-xs text-emerald-200/80 font-medium">Sign in to access your account and farm dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 p-8 shadow-2xl space-y-5">
            
            {/* Quick Demo Customer Selector */}
            <div className="pb-2 border-b border-emerald-500/20">
              <button
                type="button"
                onClick={() => {
                  setCredential('ramesh.patel@agri.com');
                  setPassword('password123');
                  toast.success("Demo Customer credentials set! (Ramesh Patel)");
                }}
                className="w-full text-xs font-bold py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">🌾</span>
                  <span>Fill Demo Customer: Ramesh Patel</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">password123</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">Email or Mobile Number</label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Enter email or 10-digit mobile..."
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950/80 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">Password</label>
              <PasswordInput
                placeholder="Enter your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 text-sm bg-slate-950/80 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-60 text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/30 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 border-t border-emerald-500/20 text-center text-xs text-emerald-300/80 font-medium">
              New to SarkarFertilizer?{' '}
              <Link to="/register" className="font-black text-emerald-400 hover:underline">
                Create Free Account
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Reset Password</h3>
                  <p className="text-[11px] text-gray-500">Account Recovery via Mobile OTP</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStep('phone');
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: Phone */}
            {forgotStep === 'phone' && (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">Registered Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      pattern="[0-9]{10}"
                      placeholder="Enter 10-digit registered mobile..."
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {isForgotLoading ? "Sending..." : "Send Reset OTP"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: OTP */}
            {forgotStep === 'otp' && (
              <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                <p className="text-xs text-gray-600">
                  Enter the 4-digit verification code sent to <span className="font-bold text-gray-900">{forgotPhone}</span> (Demo Code: <span className="text-emerald-600 font-bold">1234</span>)
                </p>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">4-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="1 2 3 4"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-center tracking-[0.5em] text-lg font-black bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('phone')}
                    className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {isForgotLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Reset Password */}
            {forgotStep === 'reset' && (
              <form onSubmit={handleCompleteReset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">New Password</label>
                  <PasswordInput
                    icon={<Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />}
                    placeholder="Min 8 characters..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('otp')}
                    className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isForgotLoading ? "Resetting..." : "Save New Password"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
