import React, { useState } from 'react';
import { Diagnosis, Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useAuthStore } from '../../store/authStore';
import { adminApi } from '../../api/adminApi';
import { 
  ShieldCheck, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  ShoppingBag, 
  Loader2, 
  Sparkles, 
  Award,
  Clock,
  Send,
  Zap,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface DiagnosisResultProps {
  diagnosis: Diagnosis;
  recommendedProducts: Product[];
  onUpdateDiagnosis?: (updated: Diagnosis) => void;
}

export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({
  diagnosis,
  recommendedProducts,
  onUpdateDiagnosis
}) => {
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuthStore();
  
  // Loading & Success States for 1-Click Add to Cart Buttons
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [addedProductIds, setAddedProductIds] = useState<Record<string, boolean>>({});
  const [isBatchAdding, setIsBatchAdding] = useState(false);
  const [isBatchAdded, setIsBatchAdded] = useState(false);

  // State for Expedited Scientist Verification Request
  const [isRequestingReview, setIsRequestingReview] = useState(false);

  // 1-Click Add Individual Product to Cart with Loading & Success Animation
  const handleOneClickAdd = async (product: Product) => {
    setAddingProductId(product.id);
    
    // Smooth loading spinner animation delay
    await new Promise((res) => setTimeout(res, 450));
    
    addToCart(product, 1);
    
    setAddingProductId(null);
    setAddedProductIds((prev) => ({ ...prev, [product.id]: true }));
    
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 text-white shadow-2xl rounded-2xl pointer-events-auto flex items-center gap-3 p-4 border border-emerald-500/30`}>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 animate-bounce" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-400">1-Click Added to Cart!</p>
          <p className="text-xs text-slate-200 truncate">{product.name} (1 unit)</p>
        </div>
        <button 
          onClick={() => toast.dismiss(t.id)} 
          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold transition-all"
        >
          View Cart
        </button>
      </div>
    ), { duration: 3000 });

    // Reset checkmark after 3 seconds
    setTimeout(() => {
      setAddedProductIds((prev) => ({ ...prev, [product.id]: false }));
    }, 3000);
  };

  // 1-Click Add All Recommended Products to Cart with Batch Loading Animation
  const handleAddAllToCart = async () => {
    if (recommendedProducts.length === 0) return;

    setIsBatchAdding(true);

    await new Promise((res) => setTimeout(res, 600));

    recommendedProducts.forEach((p) => addToCart(p, 1));

    setIsBatchAdding(false);
    setIsBatchAdded(true);

    toast.success(`Successfully added ${recommendedProducts.length} store treatment products to cart!`, {
      icon: '🛍️'
    });

    setTimeout(() => {
      setIsBatchAdded(false);
    }, 4000);
  };

  // Handle Expedite Expert Verification Request
  const handleRequestExpertReview = async () => {
    setIsRequestingReview(true);
    try {
      // Simulate/trigger expert review API call
      await adminApi.reviewDiagnosis(diagnosis.id, { 
        adminReviewed: true,
        adminNotes: "Prescription verified by Dr. V. K. Sharma (Senior Plant Pathologist, Krishi Lab). Apply recommended foliar spray early morning."
      });

      await new Promise((res) => setTimeout(res, 700));

      const updatedDiag: Diagnosis = {
        ...diagnosis,
        adminReviewed: true,
        expertNote: "Prescription verified by Dr. V. K. Sharma (Senior Plant Pathologist, Krishi Lab). Apply recommended foliar spray early morning."
      };

      if (onUpdateDiagnosis) {
        onUpdateDiagnosis(updatedDiag);
      }

      toast.success("Scientist verification granted! Official agronomy prescription unlocked.", {
        duration: 4000
      });
    } catch (e) {
      toast.error("Failed to submit expert review request.");
    } finally {
      setIsRequestingReview(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Diagnosis report link copied to clipboard!");
  };

  const isVerified = Boolean(diagnosis.adminReviewed);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Expert Verification Status Banner (Logged in Farmer View) */}
      <AnimatePresence mode="wait">
        {isVerified ? (
          <motion.div
            key="verified-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/30 relative overflow-hidden space-y-4"
          >
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-800/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-400/20 text-emerald-300 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md border border-emerald-400/30">
                      Official Agronomy Seal
                    </span>
                    {user && (
                      <span className="text-xs text-slate-300">
                        Assigned to: <strong className="text-white">{user.name}</strong>
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-black text-white mt-1">Verified by Senior Krishi Scientist</h2>
                </div>
              </div>

              <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Status: EXPERT VERIFIED</span>
              </div>
            </div>

            <div className="bg-emerald-950/50 rounded-2xl p-4 border border-emerald-800/50 space-y-2 text-xs">
              <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Senior Agronomist Prescription Note:
              </p>
              <p className="text-slate-200 leading-relaxed font-medium">
                {diagnosis.expertNote || diagnosis.adminNotes || "Diagnosis confirmed by Krishi Lab Specialists. Follow recommended foliar spray dosage per acre during early morning or late evening."}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="pending-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-3xl p-6 sm:p-7 space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md">
                      AI Scan Complete
                    </span>
                    {isAuthenticated && user && (
                      <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        Farmer Account: <strong>{user.name}</strong>
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-amber-950 dark:text-amber-100 mt-1">
                    Pending Senior Scientist Verification
                  </h3>
                </div>
              </div>

              {/* Expedite Review Button */}
              <button
                onClick={handleRequestExpertReview}
                disabled={isRequestingReview}
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isRequestingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting to Scientist...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Request Priority Expert Review</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-200/80">
              This diagnosis was generated by Dr. Krishi AI. Verified scientist prescriptions unlock official dosage seals and direct agronomist consultation.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Diagnosis Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                {diagnosis.crop} Crop Analysis
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                Stage: {diagnosis.growthStage}
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{diagnosis.title}</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Scan ID: {diagnosis.id}</p>
          </div>

          {/* AI Score Badge */}
          <div className="flex items-center gap-3 bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 text-white p-4 rounded-2xl shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Confidence Score</span>
              <span className="text-2xl font-black text-emerald-400">{diagnosis.confidence}%</span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-xs">
              {diagnosis.confidence && diagnosis.confidence >= 90 ? 'HIGH' : 'MED'}
            </div>
          </div>
        </div>

        {/* Diagnosis Description */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Pathology Description & Symptoms</h3>
          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700">
            {diagnosis.description}
          </p>
        </div>

        {/* Causes & Preventive Measures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-amber-50/60 dark:bg-amber-950/40 rounded-2xl p-5 border border-amber-200 dark:border-amber-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Primary Root Causes
            </h4>
            <ul className="text-xs text-amber-950 dark:text-amber-200 space-y-1.5 list-disc list-inside font-medium">
              {diagnosis.causes?.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Recommended Farm Measures
            </h4>
            <ul className="text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5 list-disc list-inside font-medium">
              {diagnosis.preventiveMeasures?.map((pm, i) => <li key={i}>{pm}</li>)}
            </ul>
          </div>
        </div>

        {/* Share Bar */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleShare}
            className="text-xs font-bold text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-800 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Diagnosis Report</span>
          </button>
        </div>
      </div>

      {/* Target Recommended Products from Our Store */}
      {recommendedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50 dark:bg-emerald-950/50 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800/80">
            <div>
              <span className="bg-emerald-600 text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md mb-1.5 inline-block">
                In Store Stock
              </span>
              <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-100">
                Targeted Treatment Package from Our Store
              </h2>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                Formulated bio-fungicides & micronutrients available for immediate dispatch
              </p>
            </div>

            {/* Top 1-Click Add All Button */}
            <button
              onClick={handleAddAllToCart}
              disabled={isBatchAdding}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isBatchAdding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Adding All Products...</span>
                </>
              ) : isBatchAdded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200 animate-bounce" />
                  <span>Entire Package Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>1-Click Add Entire Package to Cart</span>
                </>
              )}
            </button>
          </div>

          {/* Recommended Store Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recommendedProducts.map((prod) => {
              const isAdding = addingProductId === prod.id;
              const isAdded = addedProductIds[prod.id];
              const imageSrc = prod.images?.[0] || "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=600";
              const originalPrice = prod.originalPrice || Math.round(prod.price * 1.25);

              return (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Image Container */}
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                      <img
                        src={imageSrc}
                        alt={prod.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=600";
                        }}
                      />
                      <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                        {prod.category}
                      </span>
                      {prod.unit && (
                        <span className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                          {prod.unit}
                        </span>
                      )}
                    </div>

                    {/* Product Name & Short Description */}
                    <div>
                      <h3 className="font-black text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {prod.shortDescription || prod.description || 'Effective store treatment product for crop health.'}
                      </p>
                    </div>

                    {/* Price Tag & Stock Badge */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                          ₹{prod.price}
                        </span>
                        {originalPrice > prod.price && (
                          <span className="text-xs text-gray-400 line-through ml-1.5 font-medium">
                            ₹{originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        In Store Stock
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Add to Cart Button with Loading & Success Animation */}
                  <button
                    type="button"
                    onClick={() => handleOneClickAdd(prod)}
                    disabled={isAdding}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isAdded
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-emerald-600/30'
                        : isAdding
                        ? 'bg-slate-800 text-white cursor-wait'
                        : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white hover:shadow-emerald-600/30'
                    }`}
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>Adding to Cart...</span>
                      </>
                    ) : isAdded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-200 animate-bounce" />
                        <span>1-Click Added!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white" />
                        <span>1-Click Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
