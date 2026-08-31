import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { apiClient as api } from '../../api/axiosInstances';
import { UserCheck, RefreshCw, CheckCircle2, Search, Zap, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Farmers: React.FC = () => {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/farmers', {
        params: {
          page,
          per_page: perPage,
          search: debouncedSearch,
          status: statusFilter,
        },
      });

      if (res.data?.data && Array.isArray(res.data.data)) {
        setFarmers(res.data.data);
        setMeta(res.data.meta || {
          current_page: page,
          per_page: perPage,
          total: res.data.data.length,
          last_page: 1,
          from: 1,
          to: res.data.data.length,
        });
        setIsCached(!!res.data.is_cached);
      } else if (Array.isArray(res.data)) {
        setFarmers(res.data);
        setMeta({
          current_page: 1,
          per_page: res.data.length,
          total: res.data.length,
          last_page: 1,
          from: res.data.length > 0 ? 1 : 0,
          to: res.data.length,
        });
      }
    } catch (err) {
      console.error('Failed to fetch farmers', err);
      toast.error('Failed to load farmer verification list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [page, perPage, debouncedSearch, statusFilter]);

  const handleVerify = async (id: number, status: string) => {
    try {
      await api.post(`/admin/farmers/${id}/verify`, {
        verification_status: status,
        kcc_number: `KCC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        subsidy_tier: 'PM-PRANAM Direct Subsidy Category A'
      });
      toast.success('Farmer KCC subsidy status approved!');
      fetchFarmers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification update failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                Farmer KCC Subsidy Verification Portal
              </h1>
              {isCached && (
                <span className="hidden md:inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  <Zap className="w-3 h-3 fill-emerald-500" />
                  Redis Cache Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verify Aadhaar biometric hashes &amp; Kisan Credit Card (KCC) credentials for government direct subsidies
            </p>
          </div>

          <button
            onClick={fetchFarmers}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Roster
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-full md:w-auto">
            {[
              { id: 'ALL', label: 'All Farmers' },
              { id: 'VERIFIED_AADHAAR', label: 'Verified KCC' },
              { id: 'PENDING_DOCUMENTATION', label: 'Pending Verification' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Per Page */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Farmer, KCC No, Phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-slate-500 font-medium">Per Page:</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="py-1.5 px-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3.5 px-4">Farmer Name</th>
                  <th className="py-3.5 px-4">Email / Phone</th>
                  <th className="py-3.5 px-4">KCC Card Number</th>
                  <th className="py-3.5 px-4">PM-PRANAM Subsidy Tier</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                {loading ? (
                  Array.from({ length: perPage }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 ml-auto"></div></td>
                    </tr>
                  ))
                ) : farmers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No farmer records found.</p>
                        <p className="text-xs text-slate-400">Try adjusting your search query or verification filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  farmers.map((farmer: any, i: number) => (
                    <tr key={farmer.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{farmer.name}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">{farmer.email || farmer.phone}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">{farmer.kcc_number || 'KCC-PENDING-REG'}</td>
                      <td className="py-3.5 px-4 text-[11px]">{farmer.subsidy_tier || 'PM-PRANAM Category A'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          farmer.verification_status === 'VERIFIED_AADHAAR'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}>
                          {farmer.verification_status === 'VERIFIED_AADHAAR' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {farmer.verification_status || 'PENDING_DOCUMENTATION'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {farmer.verification_status === 'VERIFIED_AADHAAR' ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerify(farmer.id, 'VERIFIED_AADHAAR')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition shadow-xs cursor-pointer active:scale-95"
                          >
                            Approve Subsidy
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900 dark:text-white">{meta.from || 0}</span> to <span className="font-bold text-slate-900 dark:text-white">{meta.to || 0}</span> of <span className="font-bold text-slate-900 dark:text-white">{meta.total}</span> Farmer Accounts
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1 || loading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-2 font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl">
              Page {meta.current_page} / {meta.last_page || 1}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, meta.last_page))}
              disabled={page >= meta.last_page || loading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Farmers;
