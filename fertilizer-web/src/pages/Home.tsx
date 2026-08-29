import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sprout, ArrowRight, ShieldCheck, Truck, Headphones, Award, Stethoscope, ChevronRight, Star, Calendar, Leaf, Sparkles, Zap, Activity, Droplets } from 'lucide-react';

import { ProductCard } from '../components/product/ProductCard';
import { productApi } from '../api/productApi';
import { Product, Category } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feat, trend, cats] = await Promise.all([
          productApi.getFeatured(),
          productApi.getTrending(),
          productApi.getCategories()
        ]);
        setFeatured(feat);
        setTrending(trend);
        setCategories(cats);
      } catch (e) {
        console.error("Home data error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-0 pb-0 bg-slate-950 text-slate-900 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* ─── 1. LIQUID GLASS HERO SECTION ─── */}
      <section
        className="relative pt-24 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1600')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay & Ambient Liquid Glow Blobs */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-slate-950/90 to-teal-950/92" />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/25 rounded-full blur-3xl glow-blob pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl glow-blob pointer-events-none" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            
            {/* Top Liquid Badge */}
            <div className="inline-flex items-center gap-2.5 bg-emerald-500/15 backdrop-blur-xl border border-emerald-400/30 text-emerald-300 text-xs font-black px-4 py-2 rounded-full shadow-lg">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Next-Gen Agricultural Input Marketplace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
              Smarter Yields.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-200">
                Liquid Certified Care.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              100% Government-lab verified NPK Fertilizers, Organic Bio-Enhancers, Pesticides &amp; AI Disease Diagnostics delivered directly to your farm doorstep.
            </p>

            {/* Liquid Glass Search Bar */}
            <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto lg:mx-0 p-2 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/25 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search Urea, NPK 19:19:19, Bio-Vita, Saaf Fungicide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/90 backdrop-blur-md text-slate-900 font-semibold rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-500 transition-all"
                />
                <Search className="w-5 h-5 text-emerald-700 absolute left-3.5 top-4" />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black px-7 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer transform active:scale-95"
              >
                Search Store
              </button>
            </form>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-7 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/25 transform hover:-translate-y-0.5"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={isAuthenticated ? "/diagnose" : "/login"}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/30 font-bold px-7 py-3.5 rounded-2xl text-sm transition-all"
              >
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>Run AI Crop Diagnosis</span>
              </Link>
            </div>

          </div>

          {/* Liquid Glass Feature Hero Card */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative mx-auto max-w-sm aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-2 bg-white/10 backdrop-blur-2xl">
              <img
                src="https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=600"
                alt="Fertilizer Farmer"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              {/* Floating Status Pill */}
              <div className="absolute top-6 right-6 bg-slate-950/80 backdrop-blur-xl text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                <span>AI Scanner Active</span>
              </div>

              {/* Liquid Card Bottom Detail */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/15 backdrop-blur-2xl border border-white/30 text-white space-y-1.5 shadow-2xl">
                <div className="flex items-center justify-between text-[10px] uppercase font-black text-emerald-400">
                  <span>Lab Certified NPK</span>
                  <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md font-bold">100% Water Soluble</span>
                </div>
                <p className="text-sm font-black">KrishiGold NPK 19:19:19</p>
                <p className="text-xs text-emerald-100/90 font-medium">Delivered to 12,500+ Farms this month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. BENTO GRID HIGHLIGHTS ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Why Farmers Choose Us
            </span>
            <h2 className="text-3xl font-black text-white">Agriculture Platform Built for High-Yield Farmers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1: AI Clinic */}
            <div className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-emerald-900/40 to-slate-900/60 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-6 group hover:border-emerald-400/50 transition-all">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="space-y-3 relative z-10">
                <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-400 font-bold">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Instant AI Diagnostics</span>
                <h3 className="text-2xl font-black text-white">Scan Crop Diseases &amp; Get Precise Fertilizer Dosages</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                  Upload leaf photos. Our neural network detects 150+ crop diseases, fungal infections, and nitrogen/phosphorus deficiencies with 98% laboratory accuracy.
                </p>
              </div>
              <div className="pt-4 relative z-10">
                <Link
                  to={isAuthenticated ? "/diagnose" : "/login"}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-all shadow-lg"
                >
                  <span>Test AI Diagnosis Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Bento Card 2: 100% Genuine Lab Guarantee */}
            <div className="rounded-3xl p-8 bg-slate-950/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-6 group hover:border-teal-400/40 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-teal-500/20 border border-teal-400/30 rounded-2xl flex items-center justify-center text-teal-400 font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider">Government Verified</span>
                <h3 className="text-xl font-black text-white">100% Lab-Tested Inputs</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every batch of NPK, Urea, and insecticides undergoes strict NABL quality testing before dispatch.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Zero Adulteration Guarantee
                </span>
              </div>
            </div>

            {/* Bento Card 3: Free Farm Doorstep Delivery */}
            <div className="rounded-3xl p-8 bg-slate-950/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-6 group hover:border-amber-400/40 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/30 rounded-2xl flex items-center justify-center text-amber-400 font-bold">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Express Dispatch</span>
                <h3 className="text-xl font-black text-white">Direct Farm Doorstep Shipping</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Free delivery across Haryana, Punjab &amp; UP for orders above ₹999. Heavy bag bulk dispatch available.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Live GPS Order Tracking
                </span>
              </div>
            </div>

            {/* Bento Card 4: Farm Calendar Planner */}
            <div className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-teal-900/40 to-slate-900/60 border border-teal-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-6 group hover:border-teal-400/50 transition-all">
              <div className="space-y-3 relative z-10">
                <div className="w-12 h-12 bg-teal-500/20 border border-teal-400/30 rounded-2xl flex items-center justify-center text-teal-400 font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider">Automated Agri Schedule</span>
                <h3 className="text-2xl font-black text-white">Personalized Fertilizer &amp; Spray Calendar</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                  Set your sowing date for Paddy, Wheat, Cotton, or Sugarcane. Get automatic SMS reminders when it's time for basal dosage, top dressing, or Micronutrient sprays.
                </p>
              </div>
              <div className="pt-4 relative z-10">
                <Link
                  to={isAuthenticated ? "/planner" : "/login"}
                  className="inline-flex items-center gap-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-all shadow-lg"
                >
                  <span>Open Smart Planner</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. CATEGORY SELECTOR ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Store Categories</span>
              <h2 className="text-2xl font-black text-white">Browse Certified Agricultural Inputs</h2>
            </div>
            <Link to="/products" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
              <span>View All Categories</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group bg-slate-900/90 backdrop-blur-md rounded-3xl border border-white/10 p-4 text-center hover:border-emerald-500 hover:bg-slate-850 transition-all duration-300 flex flex-col items-center justify-between space-y-3 transform hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-white/10 group-hover:scale-105 transition-transform shadow-md">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-emerald-400">
                  {cat.name}
                </h3>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {cat.count} Products
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. FEATURED PRODUCTS (LIQUID CARDS) ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Top Rated Inputs</span>
              <h2 className="text-2xl font-black text-white">Featured High-Yield Fertilizers</h2>
            </div>
            <Link to="/products" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
              <span>View All Store Products</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. TRENDING PRODUCTS ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-teal-400 text-xs font-black uppercase tracking-widest">Farmer Choices</span>
              <h2 className="text-2xl font-black text-white">Trending Bio-Enhancers &amp; Sprays</h2>
            </div>
            <Link to="/products" className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1">
              <span>Explore All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trending.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. FARMER TESTIMONIALS ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Verified Success</span>
            <h2 className="text-3xl font-black">Trusted by Over 50,000 Farmers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sardar Gurpreet Singh",
                location: "Ludhiana, Punjab",
                crop: "Paddy & Wheat (25 Acres)",
                text: "SarkarFertilizer NPK 19:19:19 and Zinc EDTA delivered directly to my farm within 2 days. Yield increased by 18% with 100% genuine products!",
                rating: 5
              },
              {
                name: "Vikramaditya Sharma",
                location: "Karnal, Haryana",
                crop: "Tomato & Vegetables",
                text: "The AI Crop Diagnosis accurately detected early blight on my tomatoes and recommended Saaf fungicide. Saved my entire harvest!",
                rating: 5
              },
              {
                name: "Rajesh Kumar Yadav",
                location: "Meerut, Uttar Pradesh",
                crop: "Sugarcane & Mustard",
                text: "Best wholesale prices for Vermicompost and Bio-Vita tonic. Customer service is available in Hindi and resolves all queries instantly.",
                rating: 5
              }
            ].map((rev, i) => (
              <div key={i} className="bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-white/10 p-7 space-y-4 shadow-xl">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic font-medium">"{rev.text}"</p>
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-xs font-bold text-white">{rev.name}</h4>
                  <p className="text-[11px] text-emerald-400">{rev.location} • <span className="text-amber-300 font-semibold">{rev.crop}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. FINAL CALLOUT ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full">
            <Leaf className="w-4 h-4" />
            Empowering Modern Indian Agriculture
          </span>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Start Growing Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">SarkarFertilizer</span>
          </h2>
          
          <p className="text-sm text-emerald-100/80 font-medium">
            Government certified fertilizers • AI-powered crop diagnosis • Smart farm calendar reminders
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/20"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/20 font-bold px-8 py-4 rounded-2xl text-sm transition-all"
              >
                <span>Create Free Account</span>
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};
