import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Tag, Trash2, UserCheck, Search, X, ChevronLeft, ChevronRight, Cpu, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/axiosInstances';
import toast from 'react-hot-toast';

interface CouponItem {
  id: number;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: string | number;
  min_order: string | number;
  is_active: boolean;
  is_new_customer_only: boolean;
  expires_at?: string;
}

export const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'PERCENT' | 'FIXED'>('FIXED');
  const [newValue, setNewValue] = useState('');
  const [newMinOrder, setNewMinOrder] = useState('499');
  const [isNewCustomerOnly, setIsNewCustomerOnly] = useState(false);

  // Search & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/coupons', {
        params: { page, per_page: perPage, search: debouncedSearch }
      });
      const raw = res.data;
      if (raw && Array.isArray(raw.data)) {
        setCoupons(raw.data);
        setMeta(raw.meta || { current_page: page, last_page: 1, per_page: perPage, total: raw.data.length });
      } else if (Array.isArray(raw)) {
        setCoupons(raw);
        setMeta({ current_page: 1, last_page: 1, per_page: raw.length, total: raw.length });
      }
    } catch (err) {
      try {
        const publicRes = await apiClient.get('/coupons/public');
        const pubData = publicRes.data || [];
        setCoupons(pubData);
        setMeta({ current_page: 1, last_page: 1, per_page: pubData.length, total: pubData.length });
      } catch (e) {
        console.error("Failed to load coupons", e);
        toast.error("Failed to fetch coupons list");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [page, perPage, debouncedSearch]);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newValue) return;

    try {
      await apiClient.post('/admin/coupons', {
        code: newCode.toUpperCase(),
        type: newType,
        value: Number(newValue),
        min_order: Number(newMinOrder),
        is_new_customer_only: isNewCustomerOnly,
        is_active: true
      });
      toast.success(`Coupon ${newCode.toUpperCase()} created successfully!`);
      setNewCode('');
      setNewValue('');
      setIsNewCustomerOnly(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/admin/coupons/${id}`);
      toast.success(`Deleted coupon successfully`);
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <AdminLayout title="Discount Coupons & Promotional Offers">
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              Discount Coupons &amp; Offers
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage farmer promotional tokens, minimum order subtotals &amp; first-time order discounts
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" /> Redis Cache Active
          </span>
        </div>

        {/* Create Coupon Card */}
        <form onSubmit={handleAddCoupon} className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-4 text-slate-800 dark:text-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Promo Token</h3>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-lg font-semibold">
              Live DB Synchronized
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Coupon Code</label>
              <input
                type="text"
                placeholder="e.g. NEWFARMER"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 uppercase font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Discount Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="FIXED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Flat Amount (₹)</option>
                <option value="PERCENT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Percentage (%)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Discount Value</label>
              <input
                type="number"
                placeholder={newType === 'FIXED' ? 'e.g. 150' : 'e.g. 10'}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Min. Order Subtotal (₹)</label>
              <input
                type="number"
                placeholder="e.g. 499"
                value={newMinOrder}
                onChange={(e) => setNewMinOrder(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* New Customer Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="newCustomerOnly"
              checked={isNewCustomerOnly}
              onChange={(e) => setIsNewCustomerOnly(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded cursor-pointer bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800"
            />
            <label htmlFor="newCustomerOnly" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Exclusive to First-Time Customers Only (0 previous orders)</span>
            </label>
          </div>

          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-md transition-all">
            Publish Token Code
          </button>
        </form>

        {/* Search & Per-Page Filter Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search coupon code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCoupons}
              className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-1.5 font-bold focus:outline-none cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* Coupons List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading coupons roster...</div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800">No active coupons found.</div>
          ) : (
            coupons.map((c) => (
              <div key={c.id || c.code} className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shadow-sm dark:shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center font-black">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-mono font-black text-slate-900 dark:text-white">{c.code}</h4>
                      {c.is_new_customer_only && (
                        <span className="bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          New Customer Only
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Min. Order: ₹{c.min_order} • Expires: {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : 'No Expiry'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full">
                    {c.type === 'PERCENT' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                  </span>
                  <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer p-1 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{meta.current_page}</span> of <span className="font-bold text-slate-900 dark:text-white">{meta.last_page}</span> ({meta.total} Total Coupons)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1 || isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold">
              {page} / {meta.last_page}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, meta.last_page))}
              disabled={page >= meta.last_page || isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
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

export default Coupons;
