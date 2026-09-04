import React from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Award, 
  Microscope, 
  RefreshCw, 
  Headphones, 
  Tag, 
  Sparkles, 
  CheckCircle2,
  Leaf
} from 'lucide-react';

interface TickerItem {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge: string;
  highlightColor: string;
}

const TICKER_ITEMS: TickerItem[] = [
  {
    id: 'cert',
    icon: ShieldCheck,
    title: '100% Govt Certified',
    subtitle: 'Direct from Licensed Fertilizer Manufacturers',
    badge: 'Verified',
    highlightColor: 'from-emerald-500/20 to-green-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'delivery',
    icon: Truck,
    title: 'Same-Day Dispatch',
    subtitle: 'Express Doorstep Delivery Across 15,000+ Pin Codes',
    badge: 'Express',
    highlightColor: 'from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
  },
  {
    id: 'iso',
    icon: Award,
    title: 'ISO 9001:2015 Quality',
    subtitle: '100% Lab Tested Purity & Soluble NPK Formula',
    badge: 'ISO Certified',
    highlightColor: 'from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
  },
  {
    id: 'organic',
    icon: Leaf,
    title: 'ECOCERT Bio-Organic',
    subtitle: 'Residue-Free Chemical Alternatives & Bio-Stimulants',
    badge: 'Bio-Safe',
    highlightColor: 'from-teal-500/20 to-emerald-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30'
  },
  {
    id: 'moneyback',
    icon: RefreshCw,
    title: '100% Money-Back Guarantee',
    subtitle: 'Full Replacement or Refund for Damaged Shipments',
    badge: 'Guaranteed',
    highlightColor: 'from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },
  {
    id: 'agronomy',
    icon: Headphones,
    title: '24/7 Expert Agronomist',
    subtitle: 'Free Toll-Free Crop Call & Dosage Guidance',
    badge: 'Live Call',
    highlightColor: 'from-indigo-500/20 to-sky-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'pricing',
    icon: Tag,
    title: 'Direct Factory Pricing',
    subtitle: 'Save up to 35% with Zero Middleman Wholesale Rates',
    badge: 'Best Price',
    highlightColor: 'from-rose-500/20 to-orange-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
  },
  {
    id: 'ai-scan',
    icon: Sparkles,
    title: 'Instant AI Pest Diagnostics',
    subtitle: '98.4% Accurate Crop Disease Detection in Seconds',
    badge: 'AI Powered',
    highlightColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
  }
];

export const InfiniteMarqueeTicker: React.FC = () => {
  // Duplicate array twice to ensure seamless continuous scrolling
  const duplicatedItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="w-full relative overflow-hidden py-4 sm:py-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-y border-emerald-500/30 shadow-xl group selection:bg-emerald-500 selection:text-slate-950">
      {/* ── Outer Left & Right Edge Gradient Masks ── */}
      <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 z-20 pointer-events-none bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />
      <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 z-20 pointer-events-none bg-gradient-to-l from-slate-900 via-slate-900/90 to-transparent" />

      {/* Hover Pause Hint Badge */}
      <div className="absolute top-1 right-6 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:block">
        <span className="text-[10px] font-bold text-emerald-400/90 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-sm backdrop-blur-md">
          </span>
      </div>

      {/* Marquee Motion Track */}
      <div className="flex w-max items-center animate-marquee group-hover:[animation-play-state:paused] will-change-transform">
        {duplicatedItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={`${item.id}-${index}`}
              className="inline-flex items-center gap-3.5 mx-3 sm:mx-5 px-4 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 hover:border-emerald-500/50 shadow-md hover:shadow-emerald-500/20 backdrop-blur-md transition-all duration-200 shrink-0 cursor-pointer"
            >
              {/* Icon Container with Gradient Pill */}
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.highlightColor} border flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              {/* Text Information */}
              <div className="flex flex-col text-left pr-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-white tracking-tight whitespace-nowrap">
                    {item.title}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                    {item.badge}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-300 font-medium whitespace-nowrap">
                  {item.subtitle}
                </span>
              </div>

              {/* Separator Dot */}
              <div className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
