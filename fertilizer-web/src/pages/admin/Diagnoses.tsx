import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Diagnosis } from '../../types';
import { Stethoscope, CheckCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const Diagnoses: React.FC = () => {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        const data = await adminApi.getDiagnoses();
        setDiagnoses(data);
      } catch (e) {
        console.error("Admin diagnoses error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiagnoses();
  }, []);

  const handleReview = async (id: string) => {
    try {
      await adminApi.reviewDiagnosis(id);
      toast.success("Diagnosis marked as Scientist Reviewed!");
      setDiagnoses(diagnoses.map(d => d.id === id ? { ...d, adminReviewed: true } : d));
    } catch (e) {
      toast.error("Failed to review diagnosis.");
    }
  };

  return (
    <AdminLayout title="Agri Scientist Crop Scan Reviews">
      <div className="space-y-6">
        <p className="text-xs text-gray-500">Review AI leaf disease diagnoses and confirm treatment package recommendations.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diagnoses.map((d) => (
            <div key={d.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">{d.crop} Crop</span>
                {d.adminReviewed ? (
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Reviewed
                  </span>
                ) : (
                  <button onClick={() => handleReview(d.id)} className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-xl cursor-pointer">
                    Verify Diagnosis
                  </button>
                )}
              </div>

              <h3 className="font-black text-sm text-gray-900">{d.title}</h3>
              <p className="text-xs text-gray-600">{d.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
