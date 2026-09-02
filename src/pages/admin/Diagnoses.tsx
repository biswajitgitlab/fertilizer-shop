import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Diagnosis } from '../../types';
import {
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Activity,
  CheckCircle2,
  Clock,
  Sprout,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const FALLBACK_CROP_IMAGE = "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600";

export const Diagnoses: React.FC = () => {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Standard Admin Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      setIsLoading(true);
      try {
        const data = await adminApi.getDiagnoses();
        setDiagnoses(data);
      } catch (e) {
        console.error("Admin diagnoses error:", e);
        toast.error("Failed to load crop scan reviews.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiagnoses();
  }, []);

  const handleReview = async (id: string) => {
    try {
      await adminApi.reviewDiagnosis(id, { adminReviewed: true });
      toast.success("Diagnosis marked as Scientist Reviewed!");
      setDiagnoses(prev => prev.map(d => d.id === id ? { ...d, adminReviewed: true } : d));
    } catch (e) {
      toast.error("Failed to update diagnosis status.");
    }
  };

  const filteredDiagnoses = diagnoses.filter(d => {
    const matchesTab =
      activeTab === 'all' ? true :
      activeTab === 'pending' ? !d.adminReviewed :
      d.adminReviewed;

    const matchesSearch =
      (d.crop || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Reset page when tab or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredDiagnoses.length / itemsPerPage) || 1;
  const paginatedDiagnoses = filteredDiagnoses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalScans = diagnoses.length;
  const pendingCount = diagnoses.filter(d => !d.adminReviewed).length;
  const reviewedCount = diagnoses.filter(d => d.adminReviewed).length;
  const highSeverityCount = diagnoses.filter(d => d.severity === 'High').length;

  return (
    <AdminLayout title="Agri Scientist Crop Scan Reviews">
      <div className="space-y-6">
        {/* Header Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Scans</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{totalScans}</h3>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending Review</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{pendingCount}</h3>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified by Experts</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{reviewedCount}</h3>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">High Severity Outbreaks</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{highSeverityCount}</h3>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Scans ({totalScans})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Pending Verification ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('reviewed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'reviewed'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Scientist Verified ({reviewedCount})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search crop or disease..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0">
              <span className="font-medium">Per Page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-1.5 font-bold focus:outline-none cursor-pointer"
              >
                <option value={6}>6 / page</option>
                <option value={12}>12 / page</option>
                <option value={24}>24 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-1/3" />
                <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : filteredDiagnoses.length === 0 ? (
          /* Empty State */
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-12 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-4 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Crop Diagnoses Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchQuery ? `No scan results matching "${searchQuery}".` : 'No crop scans submitted in this filter category.'}
            </p>
          </div>
        ) : (
          /* Diagnosis Cards Grid & Standard Admin Pagination */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {paginatedDiagnoses.map((d) => {
                  const img = d.images?.[0] || FALLBACK_CROP_IMAGE;
                  const isHighSeverity = d.severity === 'High';
                  const isMediumSeverity = d.severity === 'Medium';

                  return (
                    <motion.div
                      key={d.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Card Header Pills */}
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                              <Sprout className="w-3.5 h-3.5" />
                              {d.crop} Crop
                            </span>

                            {d.confidence && (
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                {d.confidence}% Confidence
                              </span>
                            )}
                          </div>

                          {/* Status / Action */}
                          {d.adminReviewed ? (
                            <span className="bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                              Scientist Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => handleReview(d.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-md hover:shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Verify Diagnosis
                            </button>
                          )}
                        </div>

                        {/* Image & Main Info */}
                        <div className="flex gap-4 items-start pt-2">
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                            <img
                              src={img}
                              alt={d.title || d.crop}
                              className="w-full h-full object-cover object-center"
                              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_CROP_IMAGE; }}
                            />
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {d.severity && (
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                  isHighSeverity
                                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                                    : isMediumSeverity
                                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                                }`}>
                                  {d.severity} Risk
                                </span>
                              )}
                              {d.growthStage && (
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  Stage: {d.growthStage}
                                </span>
                              )}
                            </div>

                            <h3 className="font-black text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                              {d.title || `${d.crop} Disease Scan`}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {d.description || 'No detailed description provided.'}
                            </p>
                          </div>
                        </div>

                        {/* Symptoms Tags */}
                        {d.symptoms && d.symptoms.length > 0 && (
                          <div className="pt-2">
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Identified Symptoms:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {d.symptoms.map((s, idx) => (
                                <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-md">
                                  • {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommended Preventive Measures */}
                        {d.preventiveMeasures && d.preventiveMeasures.length > 0 && (
                          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                            <p className="font-bold text-[11px] flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                              <Activity className="w-3.5 h-3.5" /> Recommended Remedy / Spray:
                            </p>
                            <ul className="list-disc list-inside text-[11px] space-y-0.5 text-emerald-800 dark:text-emerald-300/90 font-medium">
                              {d.preventiveMeasures.map((m, idx) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
                        <span>Submitted: {new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">ID: {d.id}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Standard Admin Server/Client Pagination Bar */}
            <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-medium">
                Showing Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({filteredDiagnoses.length} Total Records)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage <= 1 || isLoading}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages || isLoading}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Diagnoses;
