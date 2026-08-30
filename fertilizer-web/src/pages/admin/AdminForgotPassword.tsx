import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAuthApi } from '../../api/adminApi';
import { ShieldCheck, ArrowLeft, KeyRound, CheckCircle2, Mail, Lock, Building2, Server, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from '../../components/common/Logo';

import { PasswordInput } from '../../components/common/PasswordInput';

export const AdminForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [credential, setCredential] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'otp' | 'reset'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1: Request Staff OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!credential.trim()) {
      toast.error("Please enter your registered corporate email or mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminAuthApi.requestForgotPassword(credential.trim());
      setStep('otp');
      toast.success(res.message || "Security verification code sent to staff contact!");
    } catch (err: any) {
      console.error("Staff forgot password request error:", err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.credential?.[0] || "No staff account found with this corporate credential.";
      setErrorMessage(msg);
      toast.error("Account verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Staff OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otp || otp.length < 4) {
      toast.error("Please enter the 4-digit staff security code.");
      return;
    }

    setIsLoading(true);
    try {
      await adminAuthApi.verifyForgotPasswordOtp(credential.trim(), otp.trim());
      setStep('reset');
      toast.success("Security OTP verified! Set up new staff credentials.");
    } catch (err: any) {
      console.error("Staff OTP verification error:", err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.otp?.[0] || "Invalid or expired staff security verification code.";
      setErrorMessage(msg);
      toast.error("Code verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Complete Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || newPassword.length < 8) {
      toast.error("New staff password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminAuthApi.resetPassword({
        credential: credential.trim(),
        otp: otp.trim(),
        password: newPassword,
      });

      toast.success(res.message || "Staff password updated successfully!");
      navigate('/admin/login');
    } catch (err: any) {
      console.error("Staff password reset error:", err);
      const msg = err.response?.data?.message || "Failed to update staff credentials.";
      setErrorMessage(msg);
      toast.error("Password reset failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative font-sans text-slate-100 bg-slate-950">
      
      {/* Left Panel — Corporate Security Management Side Banner */}
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
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Corporate Logo Header */}
        <div className="relative z-10">
          <Logo variant="hero" />
        </div>

        {/* Left Side Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Internal Staff Security &amp; Credentials Recovery
            </span>
            <h2 className="text-4xl font-black text-white leading-tight">
              Reset Staff<br />
              <span className="text-emerald-400">Portal Security Key</span><br />
              Secure 256-Bit Verification
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              Authorized personnel password recovery. Verify your registered corporate email or phone number to set a new password.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Building2 className="w-5 h-5" />, label: 'Staff Recovery', sub: 'Identity Check' },
              { icon: <KeyRound className="w-5 h-5" />, label: 'Secure OTP', sub: 'Single-Use Code' },
              { icon: <Server className="w-5 h-5" />, label: 'RBAC Protection', sub: 'Audit Trail' },
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
          © {new Date().getFullYear()} SarkarFertilizer Enterprise Systems. Audit Log Active.
        </p>
      </div>

      {/* Right Panel — Interactive Recovery Wizard */}
      <div
        className="w-full lg:w-1/2 relative flex items-center justify-center bg-slate-950 px-6 py-12 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/96 via-slate-950/94 to-emerald-950/96 backdrop-blur-xs" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 w-full max-w-md space-y-6">

          {/* BACK TO STAFF LOGIN */}
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-800 transition-all cursor-pointer backdrop-blur-md shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to Staff Sign In</span>
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center py-2">
            <Logo variant="hero" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Staff Account Recovery 🔑</h1>
            <p className="text-xs text-slate-400">
              {step === 'request' && 'Enter your corporate email or mobile number to receive a security OTP'}
              {step === 'otp' && 'Enter the 4-digit verification code sent to your staff contact'}
              {step === 'reset' && 'Set a strong new security password for your staff account'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step Progress Indicator */}
          <div className="flex items-center gap-2">
            {[
              { key: 'request', label: '1. Corporate Contact' },
              { key: 'otp', label: '2. Staff OTP' },
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

          {/* STEP 1: REQUEST STAFF OTP */}
          {step === 'request' && (
            <form onSubmit={handleRequestOtp} className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Corporate Email or Mobile</label>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-60 text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/20 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Staff Verification Code</span>
                    <KeyRound className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY STAFF OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider text-center">4-Digit Security Code</label>
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
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-60 text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/20 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Security Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: RESET STAFF PASSWORD */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">New Password (Min 8 Chars)</label>
                <PasswordInput
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Confirm New Password</label>
                <PasswordInput
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span>Update Staff Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-500" />
            <span>Restricted Enterprise Security Recovery Protocol</span>
          </div>

        </div>
      </div>
    </div>
  );
};
