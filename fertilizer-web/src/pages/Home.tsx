import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Star, Calendar, Bug, PackageCheck, Zap, Activity, Sparkles, User, CheckCircle } from 'lucide-react';

import { ProductCard } from '../components/product/ProductCard';
import { productApi } from '../api/productApi';
import { Product, Category } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { PageTransition } from '../components/common/PageTransition';
import { RecentlyViewedSection } from '../components/product/RecentlyViewedSection';
import { TrendingProductsSection } from '../components/product/TrendingProductsSection';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { useSiteSettingsStore } from '../store/siteSettingsStore';
import { DynamicCouponOfferBanner } from '../components/common/DynamicCouponOfferBanner';
import { CategoryCarousel } from '../components/home/CategoryCarousel';
import { ServicesCarousel } from '../components/home/ServicesCarousel';
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

// Dedicated, authentic crop input product photos
const VIBRANT_FARM_HERO = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800";
const VIBRANT_CROP_SPRAY = "/images/products/confidor_insecticide.png";
const VIBRANT_FERTILIZER_SOIL = "/images/products/npk_19_19_19.png";
const VIBRANT_ORGANIC_COMPOST = "/images/categories/organic_bio_fertilizers.png";
const VIBRANT_SEEDS = "/images/products/pusa_basmati_seeds.png";
const VIBRANT_GREEN_CROPS = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=800";
const VIBRANT_VITAMINS = "/images/categories/plant_growth_vitamins.png";
const VIBRANT_MICRONUTRIENTS = "/images/products/chelated_zinc.png";

// High-fidelity dedicated service images
const SERVICE_AI_DOCTOR = "/images/services/ai_crop_doctor_scan.png";
const SERVICE_SOIL_LAB = "/images/services/soil_water_testing_lab.png";
const SERVICE_DOORSTEP_DELIVERY = "/images/services/doorstep_fertilizer_delivery.png";
const SERVICE_DRONE_SPRAY = "/images/services/agri_drone_spraying.png";
const SERVICE_CROP_CALENDAR = "/images/services/smart_crop_calendar.png";
const SERVICE_AGRONOMIST_CALL = "/images/services/agronomist_consultation.png";


export const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { appName } = useSiteSettingsStore();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Accurate visual image mapper for categories
  const getCategoryImage = (name: string, defaultImg?: string) => {
    if (defaultImg && !defaultImg.includes('placeholder') && !defaultImg.includes('localhost') && !defaultImg.includes('1585314062340') && !defaultImg.includes('unsplash')) {
      return defaultImg;
    }

    const lname = name.toLowerCase();
    if (lname.includes('organic') || lname.includes('bio')) return VIBRANT_ORGANIC_COMPOST;
    if (lname.includes('chemical') || lname.includes('fertilizer')) return VIBRANT_FERTILIZER_SOIL;
    if (lname.includes('pesticide') || lname.includes('insecticide')) return VIBRANT_CROP_SPRAY;
    if (lname.includes('fungicide')) return "/images/products/saaf_fungicide.png";
    if (lname.includes('herbicide') || lname.includes('weed')) return "/images/products/glycel_herbicide.png";
    if (lname.includes('vitamin') || lname.includes('stimulant')) return VIBRANT_VITAMINS;
    if (lname.includes('micronutrient') || lname.includes('zinc')) return VIBRANT_MICRONUTRIENTS;
    if (lname.includes('seed')) return VIBRANT_SEEDS;

    return VIBRANT_FERTILIZER_SOIL;
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
    <PageTransition className="w-full space-y-0 pb-0 bg-emerald-50/60 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-50 font-sans selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-300">
      
      {/* ─── 1. LIQUID GLASS HERO SPOTLIGHT CAROUSEL ─── */}
      <section className="w-full pt-3 sm:pt-6 pb-4">
        <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-10 space-y-4">
          <HeroCarousel />
          <DynamicCouponOfferBanner />
        </div>
      </section>

      {/* ─── SMART CROP ADVISORY BAR ─── */}
      <section className="w-full py-8 sm:py-10 bg-emerald-50/90 dark:bg-emerald-950 border-y border-emerald-200/60 dark:border-emerald-800/40 relative overflow-hidden backdrop-blur-md transition-colors duration-300">
        <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <AnimatedSprout size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Smart Crop Advisory Grid</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Select Your Crop for Customized Care &amp; Inputs
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium max-w-sm">
              Click any crop to discover tailored NPK schedules, pest control sprays, and high-yield fertilizers.
            </p>
          </div>

          {/* Touch-Friendly Horizontal Scroll Crop Selector Grid */}
          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 snap-x scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent" style={{ WebkitOverflowScrolling: 'touch' }}>
            {[
              { name: "Paddy (Rice)", query: "Rice", img: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=300&auto=format&fit=crop&q=80", color: "from-emerald-500/10 to-teal-500/10 border-emerald-300 dark:border-emerald-500/30" },
              { name: "Wheat", query: "Wheat", img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&auto=format&fit=crop&q=80", color: "from-amber-500/10 to-yellow-500/10 border-amber-300 dark:border-amber-500/30" },
              { name: "Tomato", query: "Tomato", img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80", color: "from-rose-500/10 to-red-500/10 border-rose-300 dark:border-rose-500/30" },
              { name: "Cotton", query: "Cotton", img: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=300&auto=format&fit=crop&q=80", color: "from-sky-500/10 to-blue-500/10 border-sky-300 dark:border-sky-500/30" },
              { name: "Sugarcane", query: "Sugarcane", img: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=300&auto=format&fit=crop&q=80", color: "from-emerald-600/10 to-green-600/10 border-emerald-300 dark:border-emerald-600/30" },
              { name: "Potato", query: "Potato", img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&auto=format&fit=crop&q=80", color: "from-amber-600/10 to-orange-600/10 border-amber-300 dark:border-amber-600/30" },
              { name: "Chilli", query: "Chilli", img: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=300&auto=format&fit=crop&q=80", color: "from-red-600/10 to-rose-600/10 border-red-300 dark:border-red-600/30" },
              { name: "Maize (Corn)", query: "Maize", img: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&auto=format&fit=crop&q=80", color: "from-yellow-500/10 to-amber-500/10 border-yellow-300 dark:border-yellow-500/30" },
            ].map((crop, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(`/products?search=${encodeURIComponent(crop.query)}`)}
                className={`snap-start shrink-0 flex items-center gap-3 bg-gradient-to-r ${crop.color} border backdrop-blur-xl p-2.5 pr-6 rounded-2xl cursor-pointer shadow-md active:scale-95 hover:scale-[1.02] transition-transform duration-150`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-white/20">
                  <img src={crop.img} alt={crop.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-slate-900 dark:text-white block leading-snug whitespace-nowrap">{crop.name}</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold whitespace-nowrap">View Recommended</span>
                </div>
              </button>
            ))}
            <div className="w-6 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ─── 2. VISUAL PHOTO BANNER GRID ─── */}
      <section className="w-full py-8 sm:py-12 bg-emerald-100/50 dark:bg-emerald-900/80 transition-colors duration-300">
        <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-10">
          <div className="text-center mb-6 sm:mb-8 space-y-1">
            <span className="text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Explore By Category
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">Certified Crop Inputs &amp; Farm Care Essentials</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            
            {/* Visual Card 1: Fertilizers */}
            <Link to="/products?category=chemical-fertilizers" className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-4/3 border border-slate-200/80 dark:border-white/20 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-400 transition-all duration-300 bg-slate-900">
              <img
                src={VIBRANT_FERTILIZER_SOIL}
                alt="Fertilizers"
                onError={(e) => { (e.target as HTMLImageElement).src = VIBRANT_FARM_HERO; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/30 to-transparent opacity-70 group-hover:opacity-95 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white space-y-0.5 sm:space-y-1 drop-shadow-lg z-10">
                <span className="bg-emerald-500 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md inline-block">Growth Fertilizers</span>
                <h3 className="text-xs sm:text-base font-black truncate group-hover:text-emerald-300 transition-colors">NPK &amp; Urea Bags</h3>
                <p className="text-[10px] sm:text-xs text-emerald-200 font-semibold flex items-center gap-1">Tap to see items <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" /></p>
              </div>
            </Link>

            {/* Visual Card 2: Pesticides */}
            <Link to="/products?category=pesticides-insecticides" className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-4/3 border border-slate-200/80 dark:border-white/20 shadow-lg hover:shadow-2xl hover:shadow-teal-500/20 hover:border-teal-400 dark:hover:border-teal-400 transition-all duration-300 bg-slate-900">
              <img
                src={VIBRANT_CROP_SPRAY}
                alt="Pesticides"
                onError={(e) => { (e.target as HTMLImageElement).src = VIBRANT_FARM_HERO; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/90 via-teal-950/30 to-transparent opacity-70 group-hover:opacity-95 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white space-y-0.5 sm:space-y-1 drop-shadow-lg z-10">
                <span className="bg-teal-500 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md inline-block">Pest Sprays</span>
                <h3 className="text-xs sm:text-base font-black truncate group-hover:text-teal-300 transition-colors">Pesticides &amp; Sprays</h3>
                <p className="text-[10px] sm:text-xs text-teal-200 font-semibold flex items-center gap-1">Tap to see items <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" /></p>
              </div>
            </Link>

            {/* Visual Card 3: Organic Compost */}
            <Link to="/products?category=organic-bio-fertilizers" className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-4/3 border border-slate-200/80 dark:border-white/20 shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-400 dark:hover:border-amber-400 transition-all duration-300 bg-slate-900">
              <img
                src={VIBRANT_ORGANIC_COMPOST}
                alt="Organic Bio Compost"
                onError={(e) => { (e.target as HTMLImageElement).src = VIBRANT_FARM_HERO; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-amber-950/30 to-transparent opacity-70 group-hover:opacity-95 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white space-y-0.5 sm:space-y-1 drop-shadow-lg z-10">
                <span className="bg-amber-400 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md inline-block">Bio-Organic Soil</span>
                <h3 className="text-xs sm:text-base font-black truncate group-hover:text-amber-300 transition-colors">Bio-Fertilizers</h3>
                <p className="text-[10px] sm:text-xs text-amber-200 font-semibold flex items-center gap-1">Tap to see items <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" /></p>
              </div>
            </Link>

            {/* Visual Card 4: Seeds */}
            <Link to="/products?category=seeds-tools" className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-4/3 border border-slate-200/80 dark:border-white/20 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-400 transition-all duration-300 bg-slate-900">
              <img
                src={VIBRANT_SEEDS}
                alt="High Yield Seeds"
                onError={(e) => { (e.target as HTMLImageElement).src = VIBRANT_FARM_HERO; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/30 to-transparent opacity-70 group-hover:opacity-95 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white space-y-0.5 sm:space-y-1 drop-shadow-lg z-10">
                <span className="bg-emerald-400 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md inline-block">Certified Seeds</span>
                <h3 className="text-xs sm:text-base font-black truncate group-hover:text-emerald-300 transition-colors">High-Yield Seeds</h3>
                <p className="text-[10px] sm:text-xs text-emerald-200 font-semibold flex items-center gap-1">Tap to see items <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" /></p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ─── 3. HIGH-YIELD SMART FARMING SERVICES CAROUSEL ─── */}
      <section className="w-full py-12 sm:py-16 bg-emerald-50/60 dark:bg-emerald-950 relative transition-colors duration-300">
        <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-10">
          <ServicesCarousel isAuthenticated={isAuthenticated} />
        </div>
      </section>

      {/* ─── 4. CATEGORIES LIST WITH RICH IMAGE TILES ─── */}
      <section className="w-full py-10 sm:py-12 bg-emerald-100/50 dark:bg-emerald-900/80 text-emerald-950 dark:text-emerald-50 transition-colors duration-300">
        <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-10">
          <CategoryCarousel categories={categories} getCategoryImage={getCategoryImage} />
        </div>
      </section>

      {/* ─── 5. FEATURED HIGH-YIELD FERTILIZERS ─── */}
      <section className="w-full py-12 sm:py-16 bg-emerald-50/60 dark:bg-emerald-950 relative transition-colors duration-300">
        <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Top Rated Inputs
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                Featured High-Yield Fertilizers
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                100% Water Soluble NPK, Urea, DAP &amp; Micronutrients
              </p>
            </div>
            <Link to="/products" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0">
              <span>View All Products</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {featured.map((prod) => (
                <ProductCard key={prod.id} product={prod} disableHoverEffect={true} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-emerald-900/80 rounded-3xl border border-emerald-200 dark:border-emerald-800/40 p-12 text-center space-y-3">
              <PackageCheck className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Loading Store Products...</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Browse our complete product catalog below.</p>
              <Link to="/products" className="inline-block bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs">
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── 6. TRENDING & MOST VISITED PRODUCTS ─── */}
      <section className="w-full py-4 sm:py-6 bg-gradient-to-b from-amber-500/5 via-orange-500/5 to-transparent dark:from-amber-950/20 dark:via-orange-950/10 dark:to-transparent">
        <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-10">
          <TrendingProductsSection />
        </div>
      </section>

      {/* ─── 6.5 RECENTLY VIEWED PRODUCTS (RETARGETING) ─── */}
      <section className="w-full py-4 sm:py-6 bg-gradient-to-b from-emerald-500/5 via-teal-500/5 to-transparent dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-transparent">
        <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-10">
          <RecentlyViewedSection />
        </div>
      </section>

      {/* ─── 7. FARMER TESTIMONIALS ─── */}
      <section className="w-full py-12 sm:py-16 bg-emerald-100/60 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-50 relative transition-colors duration-300">
        <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-10 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Verified Success
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Trusted by Over 50,000 Farmers</h2>
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
              <div key={i} className="bg-white/90 dark:bg-emerald-900/80 backdrop-blur-xl rounded-3xl border border-emerald-200/80 dark:border-emerald-800/40 p-7 space-y-4 shadow-xl">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic font-medium">"{rev.text}"</p>
                <div className="pt-4 border-t border-emerald-100 dark:border-emerald-800/40">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rev.name}</h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">{rev.location} • <span className="text-amber-600 dark:text-amber-300 font-semibold">{rev.crop}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. FINAL CALLOUT ─── */}
      <section className="w-full py-16 sm:py-24 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-center relative overflow-hidden">
        {/* High Quality Authentic Fern Frond Leaves Photo Background Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1920')` }}
        />
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full">
            <AnimatedLeaf size={16} className="text-emerald-400" />
            Empowering Modern Agriculture
          </span>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Start Growing Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">{appName.replace(/\s+/g, '')}</span>
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
