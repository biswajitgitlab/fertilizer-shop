import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sprout, ArrowRight, ShieldCheck, Truck, Headphones, Award, Stethoscope, ChevronRight, Star, Calendar, Leaf } from 'lucide-react';

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
    <div className="space-y-0 pb-0">
      
      {/* ─── Hero Section ─── */}
      <section
        className="relative text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1600')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/92 via-slate-900/88 to-emerald-900/85" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 bg-emerald-800/60 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full shadow-inner">
              <Sprout className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Government Certified Genuine Agricultural Inputs</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              Maximize Your Harvest with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Certified Fertilizers</span> &amp; Crop Protection
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              100% Genuine NPK Fertilizers, Insecticides, Herbicides, Fungicides, Plant Growth Vitamins, and High-Yield Seeds delivered directly to your farm.
            </p>

            {/* Search Bar in Hero */}
            <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto lg:mx-0 flex flex-col sm:flex-row gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search NPK, Urea, Insecticide, Pesticide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-gray-900 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none placeholder-gray-400 font-medium"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-emerald-950 cursor-pointer"
              >
                Search Store
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/50"
              >
                <span>Shop Fertilizers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={isAuthenticated ? "/diagnose" : "/login"}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold px-6 py-3 rounded-xl text-sm transition-all"
              >
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>Try Crop AI Diagnosis</span>
              </Link>
            </div>

          </div>

          {/* Hero Banner Image */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative mx-auto max-w-sm aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-500/20">
              <img
                src="https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=600"
                alt="Fertilizer Farmer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white space-y-1">
                <span className="text-[10px] uppercase font-black text-emerald-400">Featured Crop Care</span>
                <p className="text-sm font-bold">KrishiGold NPK 19:19:19 Soluble</p>
                <p className="text-xs text-emerald-200">100% Water Soluble • Rapid Absorption</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Badges Bar ─── */}
      <section className="bg-emerald-900 text-white py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs font-bold">
          {[
            { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, label: '100% Genuine Products', sub: 'Govt Lab Verified' },
            { icon: <Truck className="w-5 h-5 text-emerald-400" />, label: 'Free Farm Delivery', sub: 'Orders above ₹999' },
            { icon: <Award className="w-5 h-5 text-emerald-400" />, label: '50,000+ Farmers', sub: 'Trust SarkarFertilizer' },
            { icon: <Headphones className="w-5 h-5 text-emerald-400" />, label: '24/7 Agri Helpline', sub: '1800-888-FARM' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              {item.icon}
              <span className="text-white">{item.label}</span>
              <span className="text-emerald-400/80 font-medium text-[10px]">{item.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories Section ─── */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e9?auto=format&fit=crop&q=60&w=1400')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-slate-50/95" style={{ position: 'relative' }}>
        </div>
        <div className="max-w-7xl mx-auto relative space-y-6" style={{ backgroundColor: 'rgba(248,250,252,0.97)', borderRadius: '2rem', padding: '2rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Explore Agri Categories</h2>
              <p className="text-xs text-gray-500">Find the right treatment, nutrient, or seed for your crop</p>
            </div>
            <Link to="/products" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 p-3 text-center hover:border-emerald-500 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-between space-y-2"
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100 group-hover:scale-105 transition-transform">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-emerald-700">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-gray-400 font-semibold">{cat.count} Items</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=60&w=1400')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-white/96" />
        <div className="max-w-7xl mx-auto relative space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Featured High-Yield Fertilizers</h2>
              <p className="text-xs text-gray-500">Top rated water soluble &amp; organic soil enhancers</p>
            </div>
            <Link to="/products" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>Explore All</span>
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

      {/* ─── AI Diagnosis CTA Banner ─── */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=60&w=1400')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 to-teal-950/90" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Free AI Crop Clinic
              </span>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                Unsure which fertilizer or pesticide your crop needs?
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-medium">
                Upload leaf photos or select symptoms. Our instant AI model analyzes over 150 crop diseases and provides verified nutrient treatment recommendations.
              </p>
              <Link
                to={isAuthenticated ? "/diagnose" : "/login"}
                state={!isAuthenticated ? { from: { pathname: '/diagnose' } } : undefined}
                className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black px-6 py-3 rounded-xl text-sm transition-all shadow-lg cursor-pointer"
              >
                <Stethoscope className="w-4 h-4" />
                <span>{isAuthenticated ? 'Start Free Crop Diagnosis' : 'Login to Diagnose'}</span>
              </Link>
            </div>

            <div className="relative z-10 w-full md:w-auto flex justify-center gap-4">
              <div className="w-40 h-40 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-2xl">
                  98%
                </div>
                <p className="text-xs font-bold text-white">AI Accuracy</p>
                <p className="text-[10px] text-emerald-200">Lab Verified</p>
              </div>
              <div className="w-40 h-40 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-black text-xl">
                  150+
                </div>
                <p className="text-xs font-bold text-white">Diseases</p>
                <p className="text-[10px] text-emerald-200">Detected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trending Products ─── */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=60&w=1400')`,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
        }}
      >
        <div className="absolute inset-0 bg-slate-50/97" />
        <div className="max-w-7xl mx-auto relative space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Trending Crop Care &amp; Pesticides</h2>
              <p className="text-xs text-gray-500">Most bought products by farmers this week</p>
            </div>
            <Link to="/products" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>View All</span>
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

      {/* ─── Farm Planner CTA ─── */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&q=60&w=1400')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/92 to-orange-900/88" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-lg text-center md:text-left">
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Smart Farm Planner
              </span>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                Never miss a fertilizer schedule or planting date again
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed font-medium">
                Get AI-powered personalized crop schedules, fertilizer application reminders, and seasonal planting calendars sent directly to your phone.
              </p>
              <Link
                to={isAuthenticated ? "/planner" : "/login"}
                state={!isAuthenticated ? { from: { pathname: '/planner' } } : undefined}
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black px-6 py-3 rounded-xl text-sm transition-all shadow-lg cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{isAuthenticated ? 'Open Farm Planner' : 'Login to Plan'}</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center justify-center w-48 h-48 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20">
              <div className="text-center space-y-2">
                <Calendar className="w-12 h-12 text-amber-400 mx-auto" />
                <p className="text-white font-black text-sm">AI Crop Calendar</p>
                <p className="text-amber-200 text-[10px]">Personalized for your farm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Farmer Testimonials ─── */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1543757229-8d5a1e07e3d9?auto=format&fit=crop&q=60&w=1400')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-emerald-950/90" />
        <div className="max-w-7xl mx-auto relative space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white">Farmer Success Stories</h2>
            <p className="text-xs text-emerald-300/80">Trusted by over 50,000 farmers across Haryana, Punjab &amp; UP</p>
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
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 space-y-4">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed italic">"{rev.text}"</p>
                <div className="pt-3 border-t border-white/10">
                  <h4 className="text-xs font-bold text-white">{rev.name}</h4>
                  <p className="text-[11px] text-emerald-400">{rev.location} • <span className="text-amber-300 font-semibold">{rev.crop}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 relative text-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=60&w=1400')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 to-teal-950/95" />
        <div className="max-w-3xl mx-auto relative space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full">
            <Leaf className="w-3.5 h-3.5" />
            Join 50,000+ Farmers
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Start growing smarter today with <span className="text-emerald-400">SarkarFertilizer</span>
          </h2>
          <p className="text-sm text-emerald-100/80">Government certified products. AI-powered diagnosis. Smart farm planning. All in one place.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-xl text-sm transition-all shadow-lg"
            >
              <span>Shop Fertilizers Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold px-8 py-4 rounded-xl text-sm transition-all"
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
