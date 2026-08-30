import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { Sprout, Phone, User, MapPin, Lock, ArrowRight, ShieldCheck, Leaf, Wheat, Star, ArrowLeft } from 'lucide-react';
import { INDIAN_STATES } from '../utils/constants';
import toast from 'react-hot-toast';
import { Logo } from '../components/common/Logo';

import { PasswordInput } from '../components/common/PasswordInput';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('Haryana');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.register({ name, phone, email, state, password });
      toast.success("OTP sent to your mobile phone!");
      navigate(`/verify-otp?phone=${phone}`);
    } catch (e: any) {
      if (e.response?.status === 429) {
        toast.error("Too many registration attempts! Please wait 1 minute before trying again.");
      } else {
        toast.error(e.response?.data?.message || "Registration failed. Mobile may already exist.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Agricultural Background */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=900&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/92 via-emerald-900/85 to-teal-900/88" />

        {/* Logo */}
        <div className="relative z-10">
          <Logo variant="hero" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full">
              <Star className="w-3.5 h-3.5" />
              Join 50,000+ Farmers
            </span>
            <h2 className="text-4xl font-black text-white leading-tight">
              Your Farm's<br />
              <span className="text-emerald-400">Best Partner.</span><br />
              Starting Today.
            </h2>
            <p className="text-emerald-100/80 text-sm leading-relaxed max-w-sm">
              Get access to government-certified fertilizers, AI crop diagnosis, personalized planting schedules and wholesale prices — all in one place.
            </p>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 space-y-3">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
            </div>
            <p className="text-white/90 text-xs leading-relaxed italic">
              "Yield increased by 22% after using IFFCO NPK from SarkarFertilizer. Delivered in 2 days directly to my farm in Karnal!"
            </p>
            <p className="text-emerald-300 text-[10px] font-bold">— Gurpreet Singh, Ludhiana (25 Acre Wheat Farm)</p>
          </div>
        </div>

        <p className="relative z-10 text-emerald-400/60 text-[10px]">
          © 2024 SarkarFertilizer. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Registration Form with Green Agricultural Atmosphere */}
      <div
        className="w-full lg:w-1/2 relative flex items-center justify-center bg-slate-950 px-6 py-8 overflow-y-auto"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Atmosphere Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/94 via-slate-950/92 to-teal-950/95 backdrop-blur-xs" />

        <div className="relative z-10 w-full max-w-md space-y-6">

          {/* BACK TO SHOP BUTTON */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-white bg-slate-900/80 hover:bg-emerald-900/80 px-4 py-2 rounded-xl border border-emerald-500/30 transition-all cursor-pointer backdrop-blur-md shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to Store</span>
          </button>

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center py-2">
            <Logo variant="hero" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Create Account 🌱</h1>
            <p className="text-xs text-emerald-200/80 font-medium">Register as a farmer to get exclusive wholesale prices</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 p-8 shadow-2xl space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950/80 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">Mobile Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950/80 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="your@email.com (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950/80 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">State *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950 border border-emerald-500/30 rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">Create Password *</label>
              <PasswordInput
                placeholder="Min 8 characters..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 text-sm bg-slate-950/80 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
                  <span>Send SMS OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 border-t border-emerald-500/20 text-center text-xs text-emerald-300/80 font-medium">
              Already registered?{' '}
              <Link to="/login" className="font-black text-emerald-400 hover:underline">
                Sign In Here
              </Link>
            </div>
          </form>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 text-[10px] text-emerald-400/70 font-semibold">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Free to Register</span>
            <span className="flex items-center gap-1"><Leaf className="w-3 h-3 text-emerald-400" /> No Spam</span>
            <span className="flex items-center gap-1"><Wheat className="w-3 h-3 text-emerald-400" /> Govt Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
