import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import {
  Search, Sprout, ShoppingBag, Stethoscope, Phone, Mail, MapPin, Eye,
  CheckCircle, XCircle, RefreshCw, X, Calendar, Globe, Layers, ShieldCheck,
  Copy, Check, FileText, ChevronLeft, ChevronRight, Cpu
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CustomerRecord {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  farm_location?: string;
  farm_size_acres?: number;
  preferred_language?: string;
  is_verified: boolean;
  created_at: string;
}

interface CustomerDetailData {
  customer: CustomerRecord;
  stats: {
    orders_count: number;
    total_spent: number;
    crop_diagnoses_count: number;
  };
  orders: any[];
}

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Search State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });

  // Detail Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetailData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [inspectingId, setInspectingId] = useState<number | string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCustomers({ page, per_page: perPage, search });
      if (res?.data) {
        setCustomers(res.data);
        if (res.meta) setMeta(res.meta);
      } else if (Array.isArray(res)) {
        setCustomers(res);
      } else {
        setCustomers([]);
      }
    } catch (e) {
      console.error("Customers error:", e);
      toast.error("Failed to load customer list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, perPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCustomers();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleInspectCustomer = async (c: CustomerRecord) => {
    setInspectingId(c.id);
    setActiveTab('profile');
    try {
      const data = await adminApi.getCustomerDetails(c.id);
      
      const mergedCustomer: CustomerRecord = {
        ...c,
        ...(data?.customer || {}),
        farm_location: data?.customer?.farm_location || c.farm_location || '',
        farm_size_acres: data?.customer?.farm_size_acres || c.farm_size_acres || undefined,
        created_at: data?.customer?.created_at || c.created_at || new Date().toISOString()
      };

      setSelectedCustomer({
        customer: mergedCustomer,
        stats: data?.stats || { orders_count: 0, total_spent: 0, crop_diagnoses_count: 0 },
        orders: data?.orders || []
      });
      setShowDetailModal(true);
    } catch (e) {
      toast.error("Failed to fetch customer profile.");
    } finally {
      setInspectingId(null);
    }
  };

  const formatDate = (dateStr?: any) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <AdminLayout title="Registered Farmer & Customer CRM">
      <div className="space-y-6">

        {/* Header Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="min-w-0 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <Sprout className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Farmer Network &amp; Buyer Directory</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Redis Cache Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Storefront buyers, farm locations, acreage holding, and order history metrics.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 z-10">
            <button
              onClick={fetchCustomers}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title="Refresh Customer CRM"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl">
              {meta.total || customers.length} Registered Farmers
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search farmer name, phone, or region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
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
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 font-bold focus:outline-none cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* Customers Container: Mobile Cards (sm:hidden) & Desktop Table (hidden sm:block) */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl overflow-hidden">
          
          {/* Mobile Customer Cards View (Visible under sm) */}
          <div className="block sm:hidden divide-y divide-emerald-100/60 dark:divide-slate-800/50">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading farmer directory...</div>
            ) : customers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No registered customers found.</div>
            ) : (
              customers.map((c) => (
                <div key={c.id} className="p-4 space-y-3 hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center font-black text-sm uppercase shrink-0">
                        {c.name ? c.name[0] : 'F'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{c.name || 'Anonymous Farmer'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">ID #{c.id}</p>
                      </div>
                    </div>

                    {c.is_verified ? (
                      <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-300 dark:border-emerald-500/30 shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-300 dark:border-amber-500/30 shrink-0">
                        <XCircle className="w-3 h-3" />
                        Unverified
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-emerald-50/50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase">Region</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {c.farm_location || 'Not Specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase">Land Holding</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {c.farm_size_acres ? `${c.farm_size_acres} Acres` : 'Not Specified'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleInspectCustomer(c)}
                      disabled={inspectingId === c.id}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all disabled:opacity-50"
                    >
                      {inspectingId === c.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      <span>{inspectingId === c.id ? 'Loading' : 'Inspect'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (Hidden under sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Farmer / Buyer</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Farm Region</th>
                  <th className="py-3.5 px-4">Land Holding</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200 font-medium">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">No registered customers found.</td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center font-black shrink-0 uppercase">
                          {c.name ? c.name[0] : 'F'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{c.name || 'Anonymous Farmer'}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Customer ID #{c.id}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{c.email}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{c.phone || 'N/A'}</span>
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{c.farm_location || 'Not Specified'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {c.farm_size_acres ? `${c.farm_size_acres} Acres` : 'Not Specified'}
                      </td>

                      <td className="py-3.5 px-4">
                        {c.is_verified ? (
                          <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-300 dark:border-emerald-500/30">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-300 dark:border-amber-500/30">
                            <XCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleInspectCustomer(c)}
                          disabled={inspectingId === c.id}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5 transition-all disabled:opacity-50"
                          title="Inspect Farmer CRM Profile"
                        >
                          {inspectingId === c.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                          <span>{inspectingId === c.id ? 'Loading...' : 'Inspect Profile'}</span>
                        </button>
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
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{meta.current_page}</span> of <span className="font-bold text-slate-900 dark:text-white">{meta.last_page}</span> ({meta.total} Total Farmers)
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

        {/* Liquid Glass Farmer Profile Modal */}
        {showDetailModal && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-scale-in text-slate-900 dark:text-white max-h-[92vh] flex flex-col relative">
              
              {/* Top Banner Gradient Mesh */}
              <div className="bg-gradient-to-r from-emerald-600/15 via-teal-600/15 to-emerald-800/15 dark:from-emerald-500/20 dark:via-teal-500/10 dark:to-slate-900/40 p-4 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-2 sm:ring-4 ring-white dark:ring-slate-800 uppercase shrink-0">
                      {selectedCustomer.customer.name ? selectedCustomer.customer.name[0] : 'F'}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                          {selectedCustomer.customer.name || 'Anonymous Farmer'}
                        </h3>
                        {selectedCustomer.customer.is_verified ? (
                          <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-500/30">
                            <XCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                        <button
                          onClick={() => copyToClipboard(selectedCustomer.customer.email, 'Email')}
                          className="flex items-center gap-1 hover:text-emerald-500 transition-colors cursor-pointer"
                          title="Click to copy email"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[140px] sm:max-w-[180px]">{selectedCustomer.customer.email}</span>
                          {copiedField === 'Email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />}
                        </button>

                        <span className="hidden sm:inline">•</span>

                        <button
                          onClick={() => copyToClipboard(selectedCustomer.customer.phone, 'Phone')}
                          className="flex items-center gap-1 hover:text-emerald-500 transition-colors cursor-pointer"
                          title="Click to copy phone"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{selectedCustomer.customer.phone || 'No phone'}</span>
                          {copiedField === 'Phone' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shrink-0"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sub Tab Navigation */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 relative z-10">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'profile'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Farm Profile &amp; Stats</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'orders'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order History ({selectedCustomer.orders.length})</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
                
                {/* CRM Key Metrics Cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-2.5 sm:p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 text-center relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1 sm:mb-2 font-bold">
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">Total Orders</p>
                    <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">{selectedCustomer.stats.orders_count}</p>
                  </div>

                  <div className="bg-blue-50/60 dark:bg-blue-950/30 p-2.5 sm:p-4 rounded-2xl border border-blue-200/60 dark:border-blue-800/40 text-center relative overflow-hidden group hover:border-blue-500/50 transition-all">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-1 sm:mb-2 font-bold">
                      <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">Total Spend</p>
                    <p className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                      ₹{Number(selectedCustomer.stats.total_spent || 0).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="bg-amber-50/60 dark:bg-amber-950/30 p-2.5 sm:p-4 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 text-center relative overflow-hidden group hover:border-amber-500/50 transition-all">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-1 sm:mb-2 font-bold">
                      <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">Diagnoses</p>
                    <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">{selectedCustomer.stats.crop_diagnoses_count}</p>
                  </div>
                </div>

                {activeTab === 'profile' ? (
                  <div className="space-y-4 animate-fade-in">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Farm &amp; Account Details</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Farm Location Card */}
                      <div className="bg-emerald-50/40 dark:bg-slate-800/80 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-500/20 flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-400">Farm Location &amp; Region</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5 truncate">
                            {selectedCustomer.customer.farm_location || 'Not Specified'}
                          </p>
                          {!selectedCustomer.customer.farm_location && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Location pending update</span>
                          )}
                        </div>
                      </div>

                      {/* Land Holding Card */}
                      <div className="bg-blue-50/40 dark:bg-slate-800/80 p-4 rounded-2xl border border-blue-200/60 dark:border-emerald-500/20 flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                          <Sprout className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-400">Land Holding / Acreage</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                            {selectedCustomer.customer.farm_size_acres ? `${selectedCustomer.customer.farm_size_acres} Acres` : 'Not Specified'}
                          </p>
                          {!selectedCustomer.customer.farm_size_acres && (
                            <span className="text-[10px] text-slate-400 font-medium">Standard smallholder parcel</span>
                          )}
                        </div>
                      </div>

                      {/* Preferred Language */}
                      <div className="bg-purple-50/40 dark:bg-slate-800/80 p-4 rounded-2xl border border-purple-200/60 dark:border-emerald-500/20 flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-400">Preferred Language</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5 uppercase">
                            {selectedCustomer.customer.preferred_language || 'Hindi / English'}
                          </p>
                        </div>
                      </div>

                      {/* Registration Date */}
                      <div className="bg-teal-50/40 dark:bg-slate-800/80 p-4 rounded-2xl border border-teal-200/60 dark:border-emerald-500/20 flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-400">Account Registered</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                            {formatDate(selectedCustomer.customer.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Recent Orders Activity</span>
                    </h4>

                    {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {selectedCustomer.orders.map((o: any, idx: number) => (
                          <div
                            key={o.id || idx}
                            className="bg-emerald-50/30 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-between gap-3 text-xs hover:border-emerald-500/40 transition-all"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <p className="font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
                                <span>Order #{o.order_number || o.id}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(o.created_at)}
                              </p>
                            </div>

                            <div className="text-right shrink-0 space-y-1">
                              <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                ₹{Number(o.total || 0).toLocaleString('en-IN')}
                              </p>
                              <span className="inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                                {o.status || 'CONFIRMED'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
                        <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-500">No storefront orders found for this buyer yet.</p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Customer CRM Record ID #{selectedCustomer.customer.id}</span>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Close Profile
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
