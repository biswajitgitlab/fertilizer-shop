import React from 'react';
import { Diagnosis, Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { Button } from '../common/Button';
import { useCart } from '../../hooks/useCart';
import { ShieldCheck, Share2, MessageSquare, AlertTriangle, CheckCircle2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

interface DiagnosisResultProps {
  diagnosis: Diagnosis;
  recommendedProducts: Product[];
}

export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({
  diagnosis,
  recommendedProducts
}) => {
  const { addToCart } = useCart();

  const handleAddAllToCart = () => {
    recommendedProducts.forEach((p) => addToCart(p, 1));
    toast.success(`Added ${recommendedProducts.length} recommended treatment products to cart!`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Diagnosis report link copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                {diagnosis.crop} Crop Analysis
              </span>
              {diagnosis.adminReviewed && (
                <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified by Agri Scientist
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{diagnosis.title}</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Growth Stage: {diagnosis.growthStage}</p>
          </div>

          {/* AI Score Badge */}
          <div className="flex items-center gap-3 bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 text-white p-4 rounded-2xl shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">AI Confidence Score</span>
              <span className="text-2xl font-black text-emerald-400">{diagnosis.confidence}%</span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-xs">
              HIGH
            </div>
          </div>
        </div>

        {/* Diagnosis Description */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Diagnosis Details</h3>
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
            <ul className="text-xs text-amber-950 dark:text-amber-200 space-y-1.5 list-disc list-inside">
              {diagnosis.causes?.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Recommended Farm Measures
            </h4>
            <ul className="text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5 list-disc list-inside">
              {diagnosis.preventiveMeasures?.map((pm, i) => <li key={i}>{pm}</li>)}
            </ul>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={handleShare} icon={<Share2 className="w-4 h-4" />}>
            Share Report
          </Button>
          <Button variant="secondary" size="sm" icon={<MessageSquare className="w-4 h-4" />}>
            Ask Agri Specialist
          </Button>
        </div>
      </div>

      {/* Recommended Products Grid */}
      {recommendedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Targeted Treatment Package</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">Formulated products to eliminate pests & restore soil health</p>
            </div>
            <Button onClick={handleAddAllToCart} icon={<ShoppingBag className="w-4 h-4" />}>
              Add All Treatment Products to Cart
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {recommendedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
