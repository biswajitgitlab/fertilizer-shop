import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { diagnoseApi } from '../api/diagnoseApi';
import { productApi } from '../api/productApi';
import { Diagnosis, Product } from '../types';
import { DiagnosisResult as ResultComponent } from '../components/diagnose/DiagnosisResult';
import { ArrowLeft, Stethoscope, RefreshCw } from 'lucide-react';

export const DiagnoseResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnosisAndProducts = async () => {
      setIsLoading(true);
      try {
        if (!id) return;
        const data = await diagnoseApi.getDiagnosisById(id);
        setDiagnosis(data);

        // Retrieve real store products matching recommended IDs or search terms
        let prods: Product[] = [];
        const rawIds: string[] = (data.recommendedProductIds || (data as any).recommended_products_json || []);

        if (Array.isArray(rawIds) && rawIds.length > 0) {
          const fetched = await Promise.all(
            rawIds.map(async (pId: string) => {
              try {
                return await productApi.getProductById(pId);
              } catch {
                return null;
              }
            })
          );
          prods = fetched.filter(Boolean) as Product[];
        }

        // If no products matched directly by ID, search real store products matching crop or disease remedy
        if (prods.length === 0) {
          try {
            const searchTerm = data.crop || 'Bio';
            const storeRes = await productApi.getProducts({ search: searchTerm });
            if (storeRes && storeRes.products && storeRes.products.length > 0) {
              prods = storeRes.products.slice(0, 3);
            }
          } catch (e) {}
        }

        // Fallback to top store products if search yields nothing
        if (prods.length === 0) {
          try {
            const fallbackRes = await productApi.getProducts({ perPage: 4 });
            if (fallbackRes && fallbackRes.products) {
              prods = fallbackRes.products.slice(0, 3);
            }
          } catch (e) {}
        }

        setRecommendedProducts(prods);
      } catch (e) {
        console.error("Diagnosis result error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnosisAndProducts();
  }, [id]);

  const handleUpdateDiagnosis = (updated: Diagnosis) => {
    setDiagnosis(updated);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto animate-spin">
          <RefreshCw className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white">Retrieving AI Agronomy & Lab Report...</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400">Fetching store remedies and scientist verification records</p>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Diagnosis Report Not Found</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400">The requested crop scan report could not be retrieved.</p>
        <Link to="/diagnose" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all">
          Start New Diagnosis
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <Link to="/diagnose" className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400">
          <ArrowLeft className="w-4 h-4" />
          <span>Run Another Diagnosis</span>
        </Link>
        <Link to="/diagnose/history" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
          View All Saved Reports
        </Link>
      </div>

      <ResultComponent 
        diagnosis={diagnosis} 
        recommendedProducts={recommendedProducts} 
        onUpdateDiagnosis={handleUpdateDiagnosis}
      />
    </div>
  );
};
