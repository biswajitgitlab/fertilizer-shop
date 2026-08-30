import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Star, Calendar, Bug, PackageCheck, Zap, Activity } from 'lucide-react';

import { ProductCard } from '../components/product/ProductCard';
import { productApi } from '../api/productApi';
import { Product, Category } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { PageTransition } from '../components/common/PageTransition';
import { RecentlyViewedSection } from '../components/product/RecentlyViewedSection';
import { TrendingProductsSection } from '../components/product/TrendingProductsSection';
import {
  AnimatedLeaf,
  AnimatedSprout,
  AnimatedShield,
  AnimatedTruck,
  AnimatedSparkles,
  AnimatedCropDoctor,
  AnimatedPulseBadge,
  AnimatedSearch
} from '../components/common/AnimatedIcons';

// Bright, high-resolution agriculture photos (100% verified 200 OK & vibrant)
const VIBRANT_FARM_HERO = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800";
const VIBRANT_CROP_SPRAY = "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=800";
const VIBRANT_FERTILIZER_SOIL = "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=800";
const VIBRANT_ORGANIC_COMPOST = "/images/categories/vermicompost_soil.png";
const VIBRANT_SEEDS = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800";
const VIBRANT_GREEN_CROPS = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=800";
const VIBRANT_VITAMINS = "/images/categories/plant_growth_vitamins.png";
const VIBRANT_MICRONUTRIENTS = "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=800";

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Accurate visual image mapper for categories
  const getCategoryImage = (name: string, defaultImg?: string) => {
    if (defaultImg && !defaultImg.includes('placeholder') && !defaultImg.includes('localhost') && !defaultImg.includes('1585314062340')) {
      return defaultImg;
    }

    const lname = name.toLowerCase();
    if (lname.includes('organic') || lname.includes('bio')) return VIBRANT_ORGANIC_COMPOST;
    if (lname.includes('chemical') || lname.includes('fertilizer')) return VIBRANT_FERTILIZER_SOIL;
    if (lname.includes('pesticide') || lname.includes('insecticide')) return VIBRANT_CROP_SPRAY;
    if (lname.includes('fungicide')) return VIBRANT_GREEN_CROPS;
    if (lname.includes('herbicide') || lname.includes('weed')) return VIBRANT_FARM_HERO;
    if (lname.includes('vitamin') || lname.includes('stimulant')) return VIBRANT_VITAMINS;
    if (lname.includes('micronutrient') || lname.includes('zinc')) return VIBRANT_MICRONUTRIENTS;
    if (lname.includes('seed')) return VIBRANT_SEEDS;

    return VIBRANT_FARM_HERO;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feat, trend, cats] = await Promise.all([
          productApi.getFeatured(),
          productApi.getTrending(),
          productApi.getCategories()
        ]);
        setFeatured(Array.isArray(feat) ? feat : []);
        setTrending(Array.isArray(trend) ? trend : []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (e) {
        console.error("Home data fetch error:", e);
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
    <PageTransition className="space-y-0 pb-0 bg-slate-950 text-slate-900 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* ─── 1. LIQUID GLASS HERO SECTION ─── */}
      <section
        className="relative pt-24 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage: `url('${VIBRANT_FARM_HERO}')`,
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
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-7 text-center lg:text-left"
          >
            
            {/* Top Liquid Badge */}
            <div className="inline-flex items-center gap-2.5 bg-emerald-500/15 backdrop-blur-xl border border-emerald-400/30 text-emerald-300 text-xs font-black px-4 py-2 rounded-full shadow-lg">
              <AnimatedSparkles size={16} className="text-emerald-400" />
              <span>Government Certified Genuine Agricultural Inputs</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
              Smarter Harvests.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-200">
                Liquid Certified Care.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              100% Genuine NPK Fertilizers, Insecticides, Herbicides, Fungicides, Bio-Enhancers, and High-Yield Seeds delivered directly to your farm.
            </p>

            {/* Liquid Glass Search Bar */}
            <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto lg:mx-0 p-2 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/25 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search NPK 19:19:19, Urea, Insecticide, Bio-Vita..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/95 backdrop-blur-md text-slate-900 font-semibold rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-500 transition-all"
                />
                <div className="absolute left-3.5 top-3.5">
                  <AnimatedSearch size={20} className="text-emerald-700" />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black px-7 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Search Store
              </motion.button>
            </form>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-7 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/25"
                >
                  <AnimatedSprout size={18} className="text-slate-950" />
                  <span>Browse Store Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to={isAuthenticated ? "/diagnose" : "/login"}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/30 font-bold px-7 py-3.5 rounded-2xl text-sm transition-all"
                >
                  <AnimatedCropDoctor size={18} className="text-emerald-400" />
                  <span>Try AI Crop Doctor</span>
                </Link>
              </motion.div>
            </div>

          </motion.div>

          {/* Liquid Glass Feature Hero Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            <div className="relative mx-auto max-w-sm aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-2 bg-white/10 backdrop-blur-2xl">
              <img
                src={VIBRANT_GREEN_CROPS}
                alt="Fertilizer Farmer"
                onError={(e) => { (e.target as HTMLImageElement).src = VIBRANT_FARM_HERO; }}
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              {/* Floating Status Pill */}
              <div className="absolute top-6 right-6 bg-slate-950/80 backdrop-blur-xl text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <AnimatedPulseBadge text="Govt Verified" color="emerald" />
              </div>

              {/* Liquid Card Bottom Detail */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/15 backdrop-blur-2xl border border-white/30 text-white space-y-1.5 shadow-2xl">
                <div className="flex items-center justify-between text-[10px] uppercase font-black text-emerald-400">
                  <span>100% Water Soluble</span>
                  <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md font-bold">NPK 19:19:19</span>
                </div>
                <p className="text-sm font-black">KrishiGold NPK Fertilizer Bag</p>
                <p className="text-xs text-emerald-100/90 font-medium">Delivered to 12,500+ Farms this month</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SMART CROP ADVISORY BAR ─── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-slate-950 border-y border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <AnimatedSprout size={14} className="text-emerald-400" />
                <span>Smart Crop Advisory Grid</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Select Your Crop for Customized Care &amp; Inputs
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium max-w-sm">
              Click any crop to discover tailored NPK schedules, pest control sprays, and high-yield fertilizers.
            </p>
          </div>

          {/* Touch-Friendly Horizontal Scroll Crop Selector Grid (Fixed trailing scroll truncation) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 snap-x scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent">
            {[
              { name: "Paddy (Rice)", query: "Rice", img: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=300&auto=format&fit=crop&q=80", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30" },
              { name: "Wheat", query: "Wheat", img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&auto=format&fit=crop&q=80", color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30" },
              { name: "Tomato", query: "Tomato", img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80", color: "from-rose-500/20 to-red-500/20 border-rose-500/30" },
              { name: "Cotton", query: "Cotton", img: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=300&auto=format&fit=crop&q=80", color: "from-sky-500/20 to-blue-500/20 border-sky-500/30" },
              { name: "Sugarcane", query: "Sugarcane", img: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=300&auto=format&fit=crop&q=80", color: "from-emerald-600/20 to-green-600/20 border-emerald-600/30" },
              { name: "Potato", query: "Potato", img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&auto=format&fit=crop&q=80", color: "from-amber-600/20 to-orange-600/20 border-amber-600/30" },
              { name: "Chilli", query: "Chilli", img: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=300&auto=format&fit=crop&q=80", color: "from-red-600/20 to-rose-600/20 border-red-600/30" },
              { name: "Maize (Corn)", query: "Maize", img: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&auto=format&fit=crop&q=80", color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30" },
            ].map((crop, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/products?search=${encodeURIComponent(crop.query)}`)}
                className={`snap-start shrink-0 flex items-center gap-3 bg-gradient-to-r ${crop.color} border backdrop-blur-xl p-2.5 pr-6 rounded-2xl cursor-pointer shadow-lg transition-all active:scale-95`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20">
                  <img src={crop.img} alt={crop.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-white block leading-snug whitespace-nowrap">{crop.name}</span>
                  <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">View Recommended</span>
                </div>
              </motion.button>
            ))}
            {/* Trailing padding element so the last items are NEVER cut off when scrolled to the end */}
            <div className="w-6 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ─── 2. VISUAL PHOTO BANNER GRID (VISUAL RECOGNITION FOR ALL USERS) ─── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 space-y-1">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Visual Quick Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Click any picture below to see products</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Visual Card 1: Fertilizers */}
            <Link to="/products?category=chemical-fertilizers" className="group relative rounded-3xl overflow-hidden aspect-4/3 border border-white/20 shadow-xl">
              <img
                src={VIBRANT_FERTILIZER_SOIL}
                alt="Fertilizers"
                onError={(e) => { (e.target as HTMLImageElement).src = VIBRANT_FARM_HERO; }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white space-y-1">
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">Growth Fertilizers</span>
                <h3 className="text-base font-black">NPK &amp; Urea Bags</h3>
                <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1">Tap to see items <ChevronRight className="w-3.5 h-3.5" /></p>
              </div>
            </Link>

            {/* Visual Card 2: Pesticides */}
            <Link to="/products?category=pesticides-insecticides" className="group relative rounded-3xl overflow-hidden aspect-4/3 border border-white/20 shadow-xl">
              <img
                src={VIBRANT_CROP_SPRAY}
                alt="Pesticides"
                onError={(e) => { (e.target as HTMLImageElement).src = VIBRANT_FARM_HERO; }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white space-y-1">
                <span className="bg-teal-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">Insect &amp; Pest Sprays</span>
                <h3 className="text-base font-black">Pesticides &amp; Insecticides</h3>
                <p className="text-xs text-teal-300 font-semibold flex items-center gap-1">Tap to see items <ChevronRight className="w-3.5 h-3.5" /></p>
              </div>
            </Link>

            {/* Visual Card 3: Organic Compost */}
            <Link to="/products?category=organic-bio-fertilizers" className="group relative rounded-3xl overflow-hidden aspect-4/3 border border-white/20 shadow-xl">
              <img
                src={VIBRANT_ORGANIC_COMPOST}
                alt="Organic Bio Compost"
                onError={(e) => { (e.target as HTMLImageElement).src = VIBRANT_FARM_HERO; }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white space-y-1">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">Bio-Organic Soil</span>
                <h3 className="text-base font-black">Vermicompost &amp; Bio-Fertilizer</h3>
                <p className="text-xs text-amber-300 font-semibold flex items-center gap-1">Tap to see items <ChevronRight className="w-3.5 h-3.5" /></p>
              </div>
            </Link>

            {/* Visual Card 4: Seeds */}
            <Link to="/products?category=seeds-tools" className="group relative rounded-3xl overflow-hidden aspect-4/3 border border-white/20 shadow-xl">
              <img
                src={VIBRANT_SEEDS}
                alt="High Yield Seeds"
                onError={(e) => { (e.target as HTMLImageElement).src = VIBRANT_FARM_HERO; }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white space-y-1">
                <span className="bg-emerald-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">Certified Seeds</span>
                <h3 className="text-base font-black">High-Yield Seeds</h3>
                <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1">Tap to see items <ChevronRight className="w-3.5 h-3.5" /></p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ─── 3. BENTO GRID HIGHLIGHTS ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Smart Platform Services
            </span>
            <h2 className="text-3xl font-black text-white">Agriculture Services Built for Maximum Yield</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1: AI Clinic */}
            <div className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-emerald-900/40 to-slate-900/60 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-6 group hover:border-emerald-400/50 transition-all">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="space-y-3 relative z-10">
                <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-400 font-bold">
                  <AnimatedCropDoctor size={24} className="text-emerald-400" />
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Instant AI Disease Diagnostics</span>
                <h3 className="text-2xl font-black text-white">Scan Leaf Diseases &amp; Get Treatment Recommendations</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                  Upload photos of affected leaves or stems. Our AI detects over 150 crop diseases and suggests verified treatments.
                </p>
              </div>
              <div className="pt-4 relative z-10">
                <Link
                  to={isAuthenticated ? "/diagnose" : "/login"}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-all shadow-lg"
                >
                  <span>Test AI Doctor Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Bento Card 2: 100% Genuine Lab Guarantee */}
            <div className="rounded-3xl p-8 bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-6 group hover:border-teal-400/40 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-teal-500/20 border border-teal-400/30 rounded-2xl flex items-center justify-center text-teal-400 font-bold">
                  <AnimatedShield size={24} className="text-teal-400" />
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
            <div className="rounded-3xl p-8 bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-6 group hover:border-amber-400/40 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/30 rounded-2xl flex items-center justify-center text-amber-400 font-bold">
                  <AnimatedTruck size={24} className="text-amber-400" />
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

      {/* ─── 4. CATEGORIES LIST WITH RICH IMAGE TILES ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Browse Categories
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Certified Agricultural Inputs &amp; Crop Care
              </h2>
            </div>
            <Link to="/products" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 shrink-0">
              <span>View All Store Categories</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((cat) => {
              const catImg = getCategoryImage(cat.name, cat.icon || cat.image);
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group bg-slate-950/90 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between shadow-xl transform hover:-translate-y-1"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-800">
                    <img
                      src={catImg}
                      alt={cat.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = VIBRANT_FARM_HERO; }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/30">
                      {cat.count || 10}+ Items
                    </span>
                  </div>

                  <div className="p-4 space-y-1 bg-gradient-to-b from-slate-950 to-slate-900">
                    <h3 className="text-sm font-black text-white line-clamp-1 group-hover:text-emerald-400">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      Explore category <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. FEATURED HIGH-YIELD FERTILIZERS ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Top Rated Inputs
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Featured High-Yield Fertilizers
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                100% Water Soluble NPK, Urea, DAP &amp; Micronutrients
              </p>
            </div>
            <Link to="/products" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 shrink-0">
              <span>View All Products</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/80 rounded-3xl border border-white/10 p-12 text-center space-y-3">
              <PackageCheck className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Loading Store Products...</h3>
              <p className="text-xs text-slate-400">Browse our complete product catalog below.</p>
              <Link to="/products" className="inline-block bg-emerald-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs">
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── 6. TRENDING & MOST VISITED PRODUCTS ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TrendingProductsSection />
      </div>

      {/* ─── 6.5 RECENTLY VIEWED PRODUCTS (RETARGETING) ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RecentlyViewedSection />
      </div>

      {/* ─── 7. FARMER TESTIMONIALS ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white relative">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Verified Success
            </span>
            <h2 className="text-3xl font-black">Trusted by Over 50,000 Farmers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Gurpreet Singh",
                location: "Ludhiana, Punjab",
                crop: "Paddy & Wheat (25 Acres)",
                text: "NPK 19:19:19 and Zinc EDTA delivered directly to my farm within 2 days. Yield increased by 18% with 100% genuine products!",
                rating: 5
              },
              {
                name: "Vikramaditya Sharma",
                location: "Karnal, Haryana",
                crop: "Tomato & Vegetables",
                text: "The AI Doctor accurately detected early blight on my tomatoes and recommended Saaf fungicide. Saved my entire harvest!",
                rating: 5
              },
              {
                name: "Rajesh Kumar Yadav",
                location: "Meerut, Uttar Pradesh",
                crop: "Sugarcane & Mustard",
                text: "Best wholesale prices for Vermicompost and Bio-Vita tonic. Customer service resolves all queries instantly.",
                rating: 5
              }
            ].map((rev, i) => (
              <div key={i} className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-7 space-y-4 shadow-xl">
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

      {/* ─── 8. FINAL CALLOUT ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full">
            <AnimatedLeaf size={16} className="text-emerald-400" />
            Empowering Modern Agriculture
          </span>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Start Growing Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">SarkarFertilizer</span>
          </h2>
          
          <p className="text-sm text-emerald-100/90 font-medium">
            Government certified fertilizers • AI-powered crop disease diagnostics • Smart spray calendars
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/20"
              >
                <span>Shop All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            {!isAuthenticated && (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/20 font-bold px-8 py-4 rounded-2xl text-sm transition-all"
                >
                  <span>Create Free Account</span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

    </PageTransition>
  );
};
