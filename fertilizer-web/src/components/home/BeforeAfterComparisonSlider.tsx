import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ChevronsLeftRight, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Sliders,
  TrendingUp,
  Leaf,
  Droplets
} from 'lucide-react';

interface ComparisonScenario {
  id: string;
  cropName: string;
  title: string;
  badgeText: string;
  beforeImg: string;
  afterImg: string;
  beforeDesc: string;
  afterDesc: string;
  yieldGain: string;
  daysToResult: string;
  recommendedProduct: string;
  productLink: string;
}

const COMPARISON_SCENARIOS: ComparisonScenario[] = [
  {
    id: 'tomato-blight',
    cropName: 'Tomato Farm',
    title: 'Fungal Blight & Nutrient Deficiency Eradication',
    badgeText: 'Proven Field Trial • Karnal, Haryana',
    beforeImg: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1000&auto=format&fit=crop&q=80&sat=-50',
    afterImg: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1000&auto=format&fit=crop&q=80',
    beforeDesc: 'Severe leaf yellowing, early blight spots, low flower drop count.',
    afterDesc: 'Lush dark green foliage, 100% blight cure, 35% higher fruit set.',
    yieldGain: '+38% Harvest Yield',
    daysToResult: '10-14 Days',
    recommendedProduct: 'Saaf Fungicide + NPK 19:19:19',
    productLink: '/products?search=fungicide'
  },
  {
    id: 'paddy-growth',
    cropName: 'Paddy / Rice Field',
    title: 'Bio-Organic Root Activation & Tillering Boost',
    badgeText: 'Pau Certified • Ludhiana, Punjab',
    beforeImg: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=1000&auto=format&fit=crop&q=80&sat=-60',
    afterImg: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=1000&auto=format&fit=crop&q=80',
    beforeDesc: 'Weak root system, pale tillers, nitrogen deficiency.',
    afterDesc: 'Deep root penetration, dense tiller formation, vibrant canopy.',
    yieldGain: '+42% Tiller Density',
    daysToResult: '12 Days',
    recommendedProduct: 'Bio-Vita Organic Growth Stimulant + Urea',
    productLink: '/products?search=bio'
  },
  {
    id: 'cotton-pest',
    cropName: 'Cotton Crop',
    title: 'Pink Bollworm & Sucking Pest Eradication',
    badgeText: 'Field Tested • Bathinda, Punjab',
    beforeImg: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=1000&auto=format&fit=crop&q=80&sat=-40',
    afterImg: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=1000&auto=format&fit=crop&q=80',
    beforeDesc: 'Boll damage, thrips attack, stunted vegetative growth.',
    afterDesc: 'Clean boll formation, full canopy expansion, zero pest damage.',
    yieldGain: '+29% Premium Lint',
    daysToResult: '7 Days',
    recommendedProduct: 'Confidor Insecticide + Chelated Zinc',
    productLink: '/products?search=confidor'
  }
];

export const BeforeAfterComparisonSlider: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('tomato-blight');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage (0 to 100)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeScenario = COMPARISON_SCENARIOS.find(s => s.id === activeScenarioId) || COMPARISON_SCENARIOS[0];

  // Calculate position from mouse or touch event
  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      updateSliderPosition(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateSliderPosition(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, updateSliderPosition]);

  return (
    <section className="w-full py-12 sm:py-16 bg-gradient-to-b from-emerald-950 via-slate-900 to-emerald-950 text-white relative overflow-hidden transition-colors duration-300">
      {/* Background Ambient Glow Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-10 space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Visual Proof &amp; Real Field Results</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Interactive Crop Transformation Inspector
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Drag the interactive slider handle or tap quick presets below to visually compare untreated crops vs fields treated with our bio-fertilizers and sprays.
            </p>
          </div>

          {/* Scenario Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {COMPARISON_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                onClick={() => {
                  setActiveScenarioId(scen.id);
                  setSliderPosition(50);
                }}
                className={`snap-start px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                  activeScenarioId === scen.id
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700/80'
                }`}
              >
                {scen.cropName}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Quick Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Quick View Presets:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSliderPosition(0)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                  sliderPosition === 0 
                    ? 'bg-rose-500 text-white shadow-md' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Before (0%)
              </button>
              <button
                onClick={() => setSliderPosition(50)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                  sliderPosition === 50 
                    ? 'bg-emerald-500 text-slate-950 shadow-md' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                50/50 Split
              </button>
              <button
                onClick={() => setSliderPosition(100)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                  sliderPosition === 100 
                    ? 'bg-teal-400 text-slate-950 shadow-md' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                After (100%)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-emerald-400">
            <span className="flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> {activeScenario.yieldGain}
            </span>
            <span className="flex items-center gap-1 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
              <Leaf className="w-3.5 h-3.5 text-teal-400" /> Results in {activeScenario.daysToResult}
            </span>
          </div>
        </div>

        {/* ── INTERACTIVE SPLIT COMPARISON CARD CONTAINER ── */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchMove={handleTouchMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="relative w-full h-[380px] sm:h-[480px] md:h-[540px] rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl select-none cursor-ew-resize group touch-none"
        >
          {/* 1. AFTER IMAGE (Base / Background layer) */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={activeScenario.afterImg} 
              alt={`${activeScenario.cropName} After Treatment`}
              className="w-full h-full object-cover"
              loading="eager"
            />
            {/* After Label Badge */}
            <div className="absolute top-4 right-4 z-10 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 block tracking-wider">AFTER TREATMENT</span>
                <span className="text-xs font-bold text-white block">{activeScenario.afterDesc}</span>
              </div>
            </div>
          </div>

          {/* 2. BEFORE IMAGE (Clipped Foreground Layer using clip-path for 60fps GPU acceleration) */}
          <div 
            className="absolute inset-0 w-full h-full will-change-[clip-path]"
            style={{
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
            }}
          >
            <img 
              src={activeScenario.beforeImg} 
              alt={`${activeScenario.cropName} Before Treatment`}
              className="w-full h-full object-cover filter contrast-125 brightness-90"
              loading="eager"
            />
            {/* Before Label Badge */}
            <div className="absolute top-4 left-4 z-10 bg-slate-950/90 text-rose-300 border border-rose-500/40 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase text-rose-400 block tracking-wider">BEFORE (UNTREATED)</span>
                <span className="text-xs font-bold text-white block">{activeScenario.beforeDesc}</span>
              </div>
            </div>
          </div>

          {/* 3. INTERACTIVE SLIDER DIVIDER LINE & HANDLE */}
          <div 
            className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none transition-shadow duration-150"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Center Slider Knob Handle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 bg-slate-950 border-2 border-emerald-400 rounded-full shadow-2xl flex items-center justify-center pointer-events-auto transform hover:scale-110 active:scale-95 transition-transform duration-150">
              <ChevronsLeftRight className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 animate-pulse" />
              {/* Percentage Indicator Tag */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                {Math.round(sliderPosition)}%
              </div>
            </div>
          </div>

          {/* Drag instruction overlay for mobile/desktop */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-slate-950/80 text-slate-300 border border-slate-700/60 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-lg pointer-events-none flex items-center gap-2">
            <ChevronsLeftRight className="w-4 h-4 text-emerald-400" />
            <span>Drag slider handle to compare</span>
          </div>
        </div>

        {/* Recommended Product CTA Box */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              Recommended Solution
            </span>
            <h4 className="text-base sm:text-lg font-black text-white">
              Achieve These Results with {activeScenario.recommendedProduct}
            </h4>
            <p className="text-xs text-slate-300">
              Government-certified formulation tested across Indian soil zones with guaranteed 100% water solubility.
            </p>
          </div>

          <a
            href={activeScenario.productLink}
            className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span>Order Recommended Inputs</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};
