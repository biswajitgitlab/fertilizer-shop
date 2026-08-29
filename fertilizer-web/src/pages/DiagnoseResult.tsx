import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { diagnoseApi } from '../api/diagnoseApi';
import { productApi } from '../api/productApi';
import { Diagnosis, Product } from '../types';
import { DiagnosisResult as ResultComponent } from '../components/diagnose/DiagnosisResult';
import { ArrowLeft } from 'lucide-react';

export const DiagnoseResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnosis = async () => {
      try {
        if (!id) return;
        const data = await diagnoseApi.getDiagnosisById(id);
        setDiagnosis(data);

        // Fetch products matching recommended IDs or category
        if (data.recommendedProducts && data.recommendedProducts.length > 0) {
          const prods = await Promise.all(
            data.recommendedProducts.map(pId => productApi.getProductById(pId))
          );
          setRecommendedProducts(prods.filter(Boolean) as Product[]);
        }
      } catch (e) {
        console.error("Diagnosis result error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiagnosis();
  }, [id]);

  if (isLoading) {
    return <div className="max-w-4xl mx-auto py-16 text-center animate-pulse">Running AI Crop Analysis...</div>;
  }

  if (!diagnosis) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Diagnosis Report Not Found</h2>
        <Link to="/diagnose" className="text-emerald-600 font-bold hover:underline">Start New Diagnosis</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/diagnose" className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Run Another Diagnosis</span>
      </Link>

      <ResultComponent diagnosis={diagnosis} recommendedProducts={recommendedProducts} />
    </div>
  );
};
