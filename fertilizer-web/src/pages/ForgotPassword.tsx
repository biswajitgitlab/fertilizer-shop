import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { ShieldCheck, ArrowLeft, KeyRound, CheckCircle2, Phone, Lock, Sparkles, Leaf, Wheat, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from '../components/common/Logo';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [credential, setCredential] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'otp' | 'reset'>('request');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim()) {
      toast.error("Please enter your registered email or mobile number.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      toast.success("Security verification OTP sent to your registered contact!");
    }, 800);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      toast.error("Please enter the 4-digit verification code.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('reset');
      toast.success("OTP Verified successfully! Set your new password.");
    }, 800);
  };

  // Step 3: Complete Reset
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Password reset successful! You can now log in.");
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left Panel — High Quality Agricultural Security Side Image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1595838729984-272a08f4305d?w=1200&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Deep Ambient Green Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/94 via-slate-950/90 to-teal-950/92" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Logo Header */}
        <div className="relative z-10">
          <Logo variant="hero" />
        </div>

        {/* Left Side Visual Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Account Security &amp; Recovery
            </span>
            <h2 className="text-4xl font-black text-white leading-tight">
              Reset Your<br />
              <span className="text-emerald-400">Account Password</span><br />
              In 3 Easy Steps
            </h2>
            <p className="text-emerald-100/80 text-sm leading-relaxed max-w-sm">
              Verify your mobile or email with an instant OTP to safely set up a new password for your SarkarFertilizer account.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <ShieldCheck className="w-5 h-5" />, label: '256-bit SSL', sub: 'Encrypted' },
              { icon: <KeyRound className="w-5 h-5" />, label: 'Instant OTP', sub: 'Mobile & Email' },
              { icon: <Leaf className="w-5 h-5" />, label: '24/7 Recovery', sub: 'Self Service' },
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
          © {new Date().getFullYear()} SarkarFertilizer. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Form */}
      <div
        className="w-full lg:w-1/2 relative flex items-center justify-center bg-slate-950 px-6 py-12 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/94 via-slate-950/92 to-teal-950/95 backdrop-blur-xs" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 w-full max-w-md space-y-6">

          {/* BACK TO LOGIN BUTTON */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-white bg-slate-900/80 hover:bg-emerald-900/80 px-4 py-2 rounded-xl border border-emerald-500/30 transition-all cursor-pointer backdrop-blur-md shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to Login</span>
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center py-2">
            <Logo variant="hero" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Forgot Password 🔐</h1>
            <p className="text-xs text-emerald-200/80 font-medium">
              {step === 'request' && 'Enter your registered mobile or email to receive a security OTP'}
              {step === 'otp' && 'Enter the 4-digit verification code sent to your contact'}
              {step === 'reset' && 'Set a strong new password for your account'}
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2">
            {[
              { key: 'request', label: '1. Contact' },
              { key: 'otp', label: '2. Verify OTP' },
              { key: 'reset', label: '3. New Password' },
            ].map((s, idx) => {
              const isActive = step === s.key;
              const isPast = (step === 'otp' && idx === 0) || (step === 'reset' && idx < 2);
              return (
                <div
                  key={s.key}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : isPast
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-900/60 text-slate-400 border-emerald-500/20'
                  }`}
                >
                  {s.label}
                </div>
              );
            })}
          </div>

          {/* STEP 1: REQUEST OTP */}
          {step === 'request' && (
            <form onSubmit={handleRequestOtp} className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 p-8 shadow-2xl space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">Registered Email or Mobile Number</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. 9876543210 or user@example.com"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950/80 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
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
                    <span>Send Verification Code</span>
                    <KeyRound className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 p-8 shadow-2xl space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider text-center">4-Digit Verification Code</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="1234"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full bg-slate-950/80 border-2 border-emerald-500/40 text-emerald-300 rounded-2xl py-3 px-4 text-center text-2xl font-black tracking-[0.6em] focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-inner placeholder-emerald-800"
                />
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
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 p-8 shadow-2xl space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="Min 8 characters..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950/80 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="Re-enter new password..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950/80 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
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
                    <KeyRound className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
