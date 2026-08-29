import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, CheckCircle2, ArrowLeft, Sprout, Leaf, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export const VerifyOtp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const phone = searchParams.get('phone') || '';
  const [otp, setOtp] = useState('1234');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter 4-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp({ phone, otp });
      login(res.user, res.token);
      toast.success("Mobile Verified Successfully!");
      navigate('/');
    } catch (e: any) {
      if (e.response?.status === 429) {
        toast.error("Too many OTP verification attempts! Please wait 1 minute before trying again.");
      } else {
        toast.error(e.response?.data?.message || "Invalid OTP code. Default demo OTP is 1234.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Deep Emerald Atmosphere Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/92 via-slate-950/90 to-teal-950/92 backdrop-blur-xs" />
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 w-full max-w-md space-y-6">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-white bg-slate-900/80 hover:bg-emerald-900/80 px-4 py-2 rounded-xl border border-emerald-500/30 transition-all cursor-pointer backdrop-blur-md shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Login</span>
        </button>

        {/* Card Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 border-2 border-emerald-300">
            <Sprout className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Verify Mobile OTP</h1>
            <p className="text-xs text-emerald-200/80 mt-1 font-medium">
              Enter 4-digit verification code sent to <span className="font-bold text-emerald-400">{phone || 'your mobile'}</span>
            </p>
          </div>
        </div>

        {/* Glassmorphic Emerald Form Card */}
        <form onSubmit={handleVerify} className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 p-8 shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider text-center">
              4-Digit Verification Code
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full bg-slate-950/80 border-2 border-emerald-500/40 text-emerald-300 rounded-2xl py-3.5 px-4 text-center text-3xl font-black tracking-[0.8em] focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-inner placeholder-emerald-800"
              />
            </div>
          </div>

          <div className="bg-emerald-950/60 rounded-xl p-3 border border-emerald-500/20 text-center">
            <p className="text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Demo OTP Code: <span className="font-black text-emerald-400 underline">1234</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/30 cursor-pointer active:scale-98"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Verify &amp; Enter Farm Store</span>
              </>
            )}
          </button>

          <div className="pt-2 text-center text-[11px] text-emerald-400/80 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Government Verified Agricultural Portal</span>
          </div>
        </form>

      </div>
    </div>
  );
};
