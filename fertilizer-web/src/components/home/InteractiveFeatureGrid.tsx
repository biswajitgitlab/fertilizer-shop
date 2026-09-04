import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Scan, 
  Calculator, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Activity,
  Cpu,
  Layers,
  ThermometerSun,
  Droplets
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const InteractiveFeatureGrid: React.FC = () => {
  // Interactive State for AI Scanner simulation
  const [activeScanCrop, setActiveScanCrop] = useState<'leaf-blight' | 'healthy-wheat' | 'root-rot'>('leaf-blight');
  const [isScanning, setIsScanning] = useState(false);

  // Interactive State for Soil NPK Calculator
  const [nitrogen, setNitrogen] = useState(40);
  const [phosphorus, setPhosphorus] = useState(25);
  const [potassium, setPotassium] = useState(35);

  const handleRunScan = (crop: 'leaf-blight' | 'healthy-wheat' | 'root-rot') => {
    setActiveScanCrop(crop);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  return (
    <section className="w-full py-16 sm:py-24 bg-gradient-to-b from-emerald-50 via-green-50/50 to-emerald-100/70 dark:from-emerald-950 dark:via-slate-900 dark:to-emerald-950 text-slate-900 dark:text-emerald-50 transition-colors duration-300 relative overflow-hidden">
      
      <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-10 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-500/20">
            <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Linear &amp; Apple Inspired Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Next-Gen Agricultural Intelligence Engine
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
            Powered by computer vision models, instant soil NPK formulation, and guaranteed doorstep fulfillment.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Interactive AI Crop Doctor Diagnostic Simulator (7 Columns) */}
          <div className="md:col-span-7 bg-white dark:bg-slate-900/90 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/40 p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-xl relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Scan className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">INSTANT AI DIAGNOSTIC SCANNER</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">AI Crop Disease Doctor</h3>
                </div>
              </div>

              <Link to="/diagnose" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                <span>Launch Full Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Interactive Image Preview with Scanner Beam */}
            <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-emerald-800/60 bg-slate-950">
              <img 
                src={
                  activeScanCrop === 'leaf-blight' 
                    ? 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80' 
                    : activeScanCrop === 'healthy-wheat' 
                    ? 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80'
                }
                alt="AI Scan Crop Sample"
                className={`w-full h-full object-cover transition-all duration-300 ${isScanning ? 'brightness-75 blur-[1px]' : 'brightness-100'}`}
              />

              {/* Laser Scanning Beam Line */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 shadow-[0_0_15px_#10b981] animate-laser-scan z-20" />
              )}

              {/* AI Diagnostic Target Box Overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-emerald-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-1 rounded w-max backdrop-blur-md">
                  <span>[AI SCANNER READY]</span>
                </div>
                <div className="self-end text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-1 rounded backdrop-blur-md">
                  CONFIDENCE: 98.6%
                </div>
              </div>

              {/* Scan Results Card Overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 border border-emerald-500/40 p-3.5 rounded-xl text-white backdrop-blur-md z-10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase block">
                    {isScanning ? 'Analyzing Crop DNA...' : 'DIAGNOSIS COMPLETE'}
                  </span>
                  <span className="text-xs font-bold text-white block">
                    {activeScanCrop === 'leaf-blight' 
                      ? 'Detected: Early Tomato Blight (Alternaria Solani)' 
                      : activeScanCrop === 'healthy-wheat'
                      ? 'Detected: Healthy Wheat Canopy (Optimal Nitrogen)'
                      : 'Detected: Paddy Stem Borer Infestation'}
                  </span>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950">
                  {activeScanCrop === 'leaf-blight' ? 'Saaf Spray Rx' : activeScanCrop === 'healthy-wheat' ? 'Optimal Growth' : 'Confidor Rx'}
                </span>
              </div>
            </div>

            {/* Tap Sample Selector Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Test AI Scanner with Sample:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunScan('leaf-blight')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeScanCrop === 'leaf-blight'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🍃 Leaf Blight
                </button>
                <button
                  onClick={() => handleRunScan('healthy-wheat')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeScanCrop === 'healthy-wheat'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🌾 Healthy Wheat
                </button>
                <button
                  onClick={() => handleRunScan('root-rot')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeScanCrop === 'root-rot'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🌱 Paddy Borer
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive NPK Soil Nutrient Calculator (5 Columns) */}
          <div className="md:col-span-5 bg-white dark:bg-slate-900/90 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/40 p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-wider">DYNAMIC NPK CALCULATOR</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Soil Nutrient Mixer</h3>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="space-y-4 pt-2">
                
                {/* Nitrogen (N) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Nitrogen (N)
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">{nitrogen} kg/acre</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={nitrogen} 
                    onChange={(e) => setNitrogen(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Phosphorus (P) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Phosphorus (P)
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono font-black">{phosphorus} kg/acre</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={phosphorus} 
                    onChange={(e) => setPhosphorus(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Potassium (K) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Potassium (K)
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono font-black">{potassium} kg/acre</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={potassium} 
                    onChange={(e) => setPotassium(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                  />
                </div>

              </div>
            </div>

            {/* Calculated Recommendation Result */}
            <div className="bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-500/30 space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                <span>Calculated Fertilizer Formula:</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono">
                  {nitrogen}:{phosphorus}:{potassium} Ratio
                </span>
              </div>
              <p className="text-sm font-extrabold text-white">
                Recommended: NPK {nitrogen > 50 ? '19:19:19 Soluble Bags' : 'Organic Bio-Compost + Zinc EDTA'}
              </p>
              <Link 
                to="/products?search=npk" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-1"
              >
                <span>Add Custom Formula to Cart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
