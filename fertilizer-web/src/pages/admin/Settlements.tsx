import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { apiClient as api } from '../../api/axiosInstances';
import { Landmark, CheckCircle, RefreshCw, Search, Filter, ChevronLeft, ChevronRight, Zap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export const Settlements: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const isDriver = (user?.role || '').toLowerCase().includes('driver');
  const [settlements, setSettlements] = useState<any[]>([]);
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

  // 300ms search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settlements', {
        params: {
          page,
          per_page: perPage,
          search: debouncedSearch,
          status: statusFilter,
        },
      });

      if (res.data?.data && Array.isArray(res.data.data)) {
        setSettlements(res.data.data);
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
        setSettlements(res.data);
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
      console.error('Failed to fetch settlements', err);
      toast.error('Failed to load driver cash settlements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [page, perPage, debouncedSearch, statusFilter]);

  const [settlingId, setSettlingId] = useState<number | null>(null);

  const handleSettle = async (id: number) => {
    setSettlingId(id);
    // Optimistic UI Update: change status instantly in local React state
    setSettlements(prev => prev.map(s => s.id === id ? { ...s, status: 'SETTLED_TO_BANK' } : s));
    try {
      await api.post(`/admin/settlements/${id}/settle`);
      toast.success('COD cash reconciled & settled to bank!');
      await fetchSettlements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Settlement execution failed');
      fetchSettlements();
    } finally {
      setSettlingId(null);
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
                <Landmark className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                COD Field Driver Settlement Portal
              </h1>
              {isCached && (
                <span className="hidden md:inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  <Zap className="w-3 h-3 fill-emerald-500" />
                  Redis Cache Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Field delivery driver cash collection reconciliation &amp; bank settlement ledger
            </p>
          </div>

          <button
            onClick={fetchSettlements}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Ledger
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-full md:w-auto">
            {[
              { id: 'ALL', label: 'All Collections' },
              { id: 'DRIVER_COLLECTION_PENDING', label: 'Pending Reconciliation' },
              { id: 'SETTLED_TO_BANK', label: 'Settled to Bank' },
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
                placeholder="Search Order ID, Driver..."
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
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Farmer / Customer</th>
                  <th className="py-3.5 px-4">Assigned Delivery Driver</th>
                  <th className="py-3.5 px-4">Cash Amount Collected</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Settlement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                {loading ? (
                  Array.from({ length: perPage }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 ml-auto"></div></td>
                    </tr>
                  ))
                ) : settlements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No driver cash settlements found.</p>
                        <p className="text-xs text-slate-400">Try adjusting your status filter or search parameters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  settlements.map((s: any, i: number) => (
                    <tr key={s.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        #{s.order_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {s.order?.user?.name || 'Customer'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {s.driver?.name || (isDriver ? user?.name : 'Unassigned Driver')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                        ₹{Number(s.cash_collected || s.order?.total || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          s.status === 'SETTLED_TO_BANK'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}>
                          {s.status === 'SETTLED_TO_BANK' ? (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <RefreshCw className="w-3 h-3 text-amber-600" />
                          )}
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {s.status === 'SETTLED_TO_BANK' ? (
                          <button
                            disabled
                            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 opacity-80 cursor-not-allowed shadow-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Bank Settled
                          </button>
                        ) : isDriver ? (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold inline-flex items-center gap-1">
                            Pending Admin Verification
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSettle(s.id)}
                            disabled={settlingId === s.id}
                            className={`px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition shadow-xs flex items-center justify-center gap-1.5 ml-auto ${settlingId === s.id ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                          >
                            {settlingId === s.id ? (
                              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Reconciling...</>
                            ) : (
                              'Reconcile to Bank'
                            )}
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
            Showing <span className="font-bold text-slate-900 dark:text-white">{meta.from || 0}</span> to <span className="font-bold text-slate-900 dark:text-white">{meta.to || 0}</span> of <span className="font-bold text-slate-900 dark:text-white">{meta.total}</span> Settlement Records
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

export default Settlements;
