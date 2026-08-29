import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sprout, ArrowRight, ShieldCheck, Truck, Headphones, Award, Stethoscope, ChevronRight, Star, Calendar, Leaf, Sparkles, Zap, Activity, Bug, PackageCheck, AlertCircle } from 'lucide-react';

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

  // Friendly category hindi/english guides for non-tech savvy farmers
  const getCategoryHelper = (name: string) => {
    const lname = name.toLowerCase();
    if (lname.includes('chemical') || lname.includes('fertilizer')) return { label: 'खाद (Fertilizers)', desc: 'फसल बढ़वार (Fast Growth)', icon: '🌾' };
    if (lname.includes('pesticide') || lname.includes('insecticide')) return { label: 'कीटनाशक (Insect Killer)', desc: 'कीड़ा मार (Pest Protection)', icon: '🐛' };
    if (lname.includes('fungicide')) return { label: 'फफूंदनाशक (Fungicide)', desc: 'पत्ती की बीमारी (Leaf Disease)', icon: '💊' };
    if (lname.includes('herbicide') || lname.includes('weed')) return { label: 'खरपतवार नाशक (Weedicide)', desc: 'घास मार (Weed Control)', icon: '🌱' };
    if (lname.includes('organic') || lname.includes('bio')) return { label: 'जैविक खाद (Organic Bio)', desc: 'मिट्टी शक्ति (Soil Vitality)', icon: '🧪' };
    if (lname.includes('seed')) return { label: 'उन्नत बीज (Certified Seeds)', desc: 'बंपर पैदावार (High Yield)', icon: '🌾' };
    if (lname.includes('vitamin') || lname.includes('growth')) return { label: 'प्लांट टॉनिक (Plant Vitamins)', desc: 'फूल-फल वर्धक (Bloom Boost)', icon: '⚡' };
    return { label: 'कृषि सामान (Agri Store)', desc: 'सरकारी लैब प्रमाणित (100% Certified)', icon: '📦' };
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
              <span>100% लैब प्रमाणित असली खाद एवं दवाइयाँ (Government Certified)</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
              उत्तम खाद, बंपर पैदावार।<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-200">
                सीधे आपके खेत तक डिलीवरी।
              </span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              असली NPK खाद, कीटनाशक, फफूंदनाशक और बीज। फोटो खींचकर खेत की बीमारी पहचानें (AI Crop Doctor) और सही दवा ऑर्डर करें।
            </p>

            {/* Liquid Glass Search Bar */}
            <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto lg:mx-0 p-2 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/25 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="खाद या दवा का नाम खोजें (Search NPK, Urea, Insecticide...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/95 backdrop-blur-md text-slate-900 font-semibold rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-500 transition-all"
                />
                <Search className="w-5 h-5 text-emerald-700 absolute left-3.5 top-4" />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black px-7 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer transform active:scale-95"
              >
                खोजें (Search)
              </button>
            </form>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-7 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/25 transform hover:-translate-y-0.5"
              >
                <span>सब सामान देखें (Browse Store)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={isAuthenticated ? "/diagnose" : "/login"}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/30 font-bold px-7 py-3.5 rounded-2xl text-sm transition-all"
              >
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>फसल की बीमारी जाँचें (AI Doctor)</span>
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
                <span>सरकारी लैब द्वारा पास (Govt Tested)</span>
              </div>

              {/* Liquid Card Bottom Detail */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/15 backdrop-blur-2xl border border-white/30 text-white space-y-1.5 shadow-2xl">
                <div className="flex items-center justify-between text-[10px] uppercase font-black text-emerald-400">
                  <span>100% घुलनशील खाद</span>
                  <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md font-bold">NPK 19:19:19</span>
                </div>
                <p className="text-sm font-black">कृषि गोल्ड NPK जल-घुलनशील</p>
                <p className="text-xs text-emerald-100/90 font-medium">12,500+ किसानों द्वारा इस महीने खरीदा गया</p>
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
              किसान सुविधा (Farmer Features)
            </span>
            <h2 className="text-3xl font-black text-white">सटीक जानकारी और असली खाद की पूरी गारंटी</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1: AI Clinic */}
            <div className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-emerald-900/40 to-slate-900/60 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-6 group hover:border-emerald-400/50 transition-all">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="space-y-3 relative z-10">
                <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-400 font-bold">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">एआई फसल डॉक्टर (AI Crop Doctor)</span>
                <h3 className="text-2xl font-black text-white">पत्ते की फोटो खींचें और 10 सेकंड में बीमारी पहचानें</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                  पत्तियों में पीलापन, कीड़ा, या फफूंद लगने पर फोटो अपलोड करें। सिस्टम 150 से अधिक बीमारियों की पहचान कर सही दवा बताएगा।
                </p>
              </div>
              <div className="pt-4 relative z-10">
                <Link
                  to={isAuthenticated ? "/diagnose" : "/login"}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-all shadow-lg"
                >
                  <span>अभी फोटो अपलोड कर बीमारी जाँचें</span>
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
                <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider">100% शुद्धता</span>
                <h3 className="text-xl font-black text-white">लैब टेस्टेड असली खाद</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  मिलावट से मुक्ति। हर NPK, यूरिया और दवा सरकारी लैब टेस्ट के बाद सीधे किसान तक पहुँचाई जाती है।
                </p>
              </div>
              <div className="pt-2">
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> 0% मिलावट की पक्की गारंटी
                </span>
              </div>
            </div>

            {/* Bento Card 3: Free Farm Doorstep Delivery */}
            <div className="rounded-3xl p-8 bg-slate-950/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-6 group hover:border-amber-400/40 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/30 rounded-2xl flex items-center justify-center text-amber-400 font-bold">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">सीधे खेत तक</span>
                <h3 className="text-xl font-black text-white">घर/खेत तक फ्री डिलीवरी</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ₹999 से ऊपर के ऑर्डर पर हरियाणा, पंजाब और उत्तर प्रदेश में डिलीवरी बिल्कुल मुफ्त।
                </p>
              </div>
              <div className="pt-2">
                <span className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> लाइव जीपीएस ट्रैकिंग
                </span>
              </div>
            </div>

            {/* Bento Card 4: Farm Calendar Planner */}
            <div className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-teal-900/40 to-slate-900/60 border border-teal-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-6 group hover:border-teal-400/50 transition-all">
              <div className="space-y-3 relative z-10">
                <div className="w-12 h-12 bg-teal-500/20 border border-teal-400/30 rounded-2xl flex items-center justify-center text-teal-400 font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider">स्मार्ट फसल कैलेंडर</span>
                <h3 className="text-2xl font-black text-white">खाद एवं स्प्रे का सही समय पर एसएमएस अलर्ट</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                  धान, गेहूं, कपास या गन्ने की बुवाई की तारीख डालें। सही दिन पर यूरिया, जिंक और स्प्रे डालने का मैसेज आपके मोबाइल पर आ जाएगा।
                </p>
              </div>
              <div className="pt-4 relative z-10">
                <Link
                  to={isAuthenticated ? "/planner" : "/login"}
                  className="inline-flex items-center gap-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-all shadow-lg"
                >
                  <span>कैलेंडर शेड्यूल शुरू करें</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. CATEGORY SELECTOR (EASY NON-TECH SAVVY GUIDES) ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                🌾 कृषि सामान श्रेणियाँ (Categories)
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                आपको किस सामान की आवश्यकता है?
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                नीचे किसी भी बॉक्स पर टच करें और अपने खेत के लिए सही दवा या खाद चुनें।
              </p>
            </div>
            <Link to="/products" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 shrink-0">
              <span>सभी श्रेणियाँ देखें (View All)</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((cat) => {
              const helper = getCategoryHelper(cat.name);
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-5 hover:border-emerald-400 hover:bg-slate-850 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl transform hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-white/10 group-hover:scale-105 transition-transform shadow-lg relative">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 bg-slate-950 text-white text-xs p-0.5 rounded-tl-md">
                        {helper.icon}
                      </span>
                    </div>
                    <div>
                      <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20 block w-max">
                        {helper.label}
                      </span>
                      <h3 className="text-sm font-black text-white line-clamp-1 mt-1 group-hover:text-emerald-300">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-amber-300 font-bold mt-0.5">
                        {helper.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                    <span className="text-[11px] text-slate-400 font-semibold">{cat.count} उत्पाद उपलब्ध</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      खोलें <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 4. FEATURED HIGH-YIELD FERTILIZERS ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                🧪 उपजाऊ खाद (High Yield Growth Fertilizers)
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                फसल की तेजी से बढ़वार और मजबूती के लिए
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                100% जल-घुलनशील NPK, यूरिया, डीएपी एवं सल्फर खाद
              </p>
            </div>
            <Link to="/products" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 shrink-0">
              <span>सभी खाद देखें (View All)</span>
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
            <div className="bg-slate-950/80 rounded-3xl border border-white/10 p-12 text-center space-y-3">
              <PackageCheck className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">खाद सूची लोड हो रही है (Loading Fertilizers)...</h3>
              <p className="text-xs text-slate-400">कृपया कुछ सेकंड प्रतीक्षा करें या नीचे बटन पर क्लिक करें।</p>
              <Link to="/products" className="inline-block bg-emerald-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs">
                दुकान खोलें (Browse Products)
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── 5. TRENDING BIO-ENHANCERS & SPRAYS ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-teal-400 text-xs font-black uppercase tracking-widest bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                🐛 कीटनाशक एवं टॉनिक (Insecticides &amp; Plant Tonics)
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                कीड़े और बीमारियों से सुरक्षा
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                इल्ली, सूंडी, सफ़ेद मक्खी और फफूंद की असरदार दवाइयाँ
              </p>
            </div>
            <Link to="/products" className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1 shrink-0">
              <span>सभी दवाइयाँ देखें (Explore All)</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {trending.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trending.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/80 rounded-3xl border border-white/10 p-12 text-center space-y-3">
              <Bug className="w-12 h-12 text-teal-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">कीटनाशक सूची लोड हो रही है (Loading Sprays)...</h3>
              <p className="text-xs text-slate-400">कृपया कुछ सेकंड प्रतीक्षा करें या नीचे बटन पर क्लिक करें।</p>
              <Link to="/products" className="inline-block bg-teal-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs">
                स्टोर देखें (Browse All)
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── 6. FARMER TESTIMONIALS ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              किसान अनुभव (Farmer Reviews)
            </span>
            <h2 className="text-3xl font-black">50,000+ किसानों का भरोसा</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "सरदार गुरप्रीत सिंह",
                location: "लुधियाना, पंजाब",
                crop: "धान एवं गेहूं (25 एकड़)",
                text: "सरकार फर्टिलाइजर का NPK 19:19:19 और जिंक 2 दिन में सीधा खेत पर डिलीवर हुआ। 100% असली सामान से पैदावार 18% बढ़ी!",
                rating: 5
              },
              {
                name: "विक्रमादित्य शर्मा",
                location: "करनाल, हरियाणा",
                crop: "टमाटर एवं सब्जियां",
                text: "एआई डॉक्टर ने टमाटर का झुलसा रोग बिल्कुल सही पहचाना और साफ़ फफूंदनाशक दवा बताई। मेरी पूरी फसल बच गई!",
                rating: 5
              },
              {
                name: "राजेश कुमार यादव",
                location: "मेरठ, उत्तर प्रदेश",
                crop: "गन्ना एवं सरसों",
                text: "वर्मीकम्पोस्ट और बायो-विटा टॉनिक का सबसे सस्ता रेट मिला। कस्टमर केयर हिंदी में पूरी सहायता करता है।",
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
            भारतीय कृषि का नया डिजिटल साथी
          </span>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            आज ही जुड़ें <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">SarkarFertilizer</span> के साथ
          </h2>
          
          <p className="text-sm text-emerald-100/90 font-medium">
            सरकारी लैब टेस्टेड खाद • एआई फसल रोग डॉक्टर • स्मार्ट स्प्रे कैलेंडर
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/20"
            >
              <span>अभी सामान खरीदें (Shop Store)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/20 font-bold px-8 py-4 rounded-2xl text-sm transition-all"
              >
                <span>नया खाता बनाएँ (Create Account)</span>
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};
