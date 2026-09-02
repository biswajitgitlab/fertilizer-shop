import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAuthStore } from '../../store/authStore';
import { apiClient as api } from '../../api/axiosInstances';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import {
  PackageCheck, Plus, RefreshCw, Warehouse, Save, X, Lock, Edit3,
  Search, Filter, ChevronLeft, ChevronRight, Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Batches: React.FC = () => {
  const { user } = useAuthStore();
  const [batches, setBatches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Pagination & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });

  // Edit Batch Modal state
  const [editingBatch, setEditingBatch] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    stock_qty: '0',
    status: 'SAFE',
    warehouse_zone: 'ZONE-A',
    expiry_date: '',
    moisture_pct: '0.00',
  });

  // RBSC Permission check
  const isSuperAdmin = user?.role === 'Super Admin' || user?.roles?.includes('Super Admin');
  const perms = user?.effective_permissions || [];
  const canEditBatch = isSuperAdmin || perms.includes('inventory.edit') || perms.includes('inventory.manage') || perms.includes('products.edit');

  const [formData, setFormData] = useState({
    product_id: '',
    batch_code: '',
    manufactured_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    moisture_pct: '2.10',
    stock_qty: '100',
    warehouse_zone: 'ZONE-A',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batchRes, prodRes, zoneRes] = await Promise.all([
        api.get('/admin/batches', {
          params: { page, per_page: perPage, search, status: statusFilter }
        }),
        api.get('/products'),
        api.get('/admin/warehouse-zones'),
      ]);

      const rawBatches = batchRes.data;
      if (rawBatches && Array.isArray(rawBatches.data)) {
        setBatches(rawBatches.data);
        setMeta(rawBatches.meta || { current_page: 1, last_page: 1, per_page: perPage, total: rawBatches.data.length });
      } else {
        setBatches(Array.isArray(rawBatches) ? rawBatches : []);
        setMeta({ current_page: 1, last_page: 1, per_page: perPage, total: Array.isArray(rawBatches) ? rawBatches.length : 0 });
      }

      setProducts(prodRes.data.data || prodRes.data || []);
      
      const rawZones = zoneRes.data;
      setZones(Array.isArray(rawZones?.data) ? rawZones.data : (Array.isArray(rawZones) ? rawZones : []));
    } catch (err) {
      console.error('Failed to fetch batches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, perPage, statusFilter]);

  // Reset pagination when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id) {
      toast.error("Please select a product from the catalog.");
      return;
    }
    try {
      await api.post('/admin/batches', formData);
      toast.success("FEFO product batch created successfully!");
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create batch');
    }
  };

  const handleOpenEdit = (b: any) => {
    if (!canEditBatch) {
      toast.error("Access Forbidden: Your account lacks [inventory.edit] permission.");
      return;
    }
    const zoneCode = typeof b.warehouse_zone === 'object' && b.warehouse_zone !== null
      ? (b.warehouse_zone.code || 'ZONE-A')
      : (b.warehouse_zone || 'ZONE-A');

    setEditingBatch(b);
    setEditFormData({
      stock_qty: String(b.stock_qty || 0),
      status: b.status || 'SAFE',
      warehouse_zone: zoneCode,
      expiry_date: b.expiry_date || '',
      moisture_pct: String(b.moisture_pct || 0),
    });
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    try {
      await api.put(`/admin/batches/${editingBatch.id}`, editFormData);
      toast.success("Batch Lot updated & Product inventory synchronized!");
      setEditingBatch(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update batch lot.');
    }
  };

  const handleProductChange = (prodId: string) => {
    const selectedProd = products.find(p => String(p.id) === String(prodId));
    let autoZone = 'ZONE-A';
    if (selectedProd) {
      const rawCat = typeof selectedProd.category === 'string'
        ? selectedProd.category
        : (selectedProd.category?.name || '');
      const cat = rawCat.toLowerCase();
      const matchedZone = zones.find(z => z.category_type && (z.category_type || '').toLowerCase() === cat);
      if (matchedZone) {
        autoZone = matchedZone.code;
      } else if (cat.includes('organic') || cat.includes('bio')) {
        autoZone = 'ZONE-B';
      } else if (cat.includes('insect') || cat.includes('pest')) {
        autoZone = 'ZONE-C';
      } else if (cat.includes('micro') || cat.includes('seed')) {
        autoZone = 'ZONE-D';
      }
    }
    setFormData(prev => ({
      ...prev,
      product_id: prodId,
      warehouse_zone: autoZone,
    }));
  };

  const getExpiryInfo = (expiryDateStr: string) => {
    if (!expiryDateStr) return { days: 0, text: 'No Expiry', badgeClass: 'bg-slate-100 text-slate-600' };
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { days: diffDays, text: `Expired ${Math.abs(diffDays)}d ago`, badgeClass: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300' };
    } else if (diffDays < 30) {
      return { days: diffDays, text: `${diffDays} days left (Critical)`, badgeClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200' };
    } else if (diffDays < 60) {
      return { days: diffDays, text: `${diffDays} days left`, badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200' };
    } else {
      return { days: diffDays, text: `${diffDays} days left`, badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200' };
    }
  };

  const productOptions = products.map((p) => ({
    value: p.id,
    label: p.name,
    sublabel: `Category: ${p.category || 'Fertilizer'} | Current Stock: ${p.stock_qty || p.stock || 0}`
  }));

  return (
    <AdminLayout title="FEFO Product Batch Manager">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                FEFO Product Batch Manager
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Redis Cache Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Lot-level shelf-life tracking, moisture analysis &amp; RBSC batch control
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Lot Batch
            </button>
            <button
              onClick={fetchData}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search batch code, product, zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="">All Batch Statuses</option>
                <option value="SAFE">SAFE</option>
                <option value="FEFO_DISPATCH_PRIORITY">FEFO DISPATCH PRIORITY</option>
                <option value="CRITICAL_EXPIRY_RISK">CRITICAL EXPIRY RISK</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>

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

        {/* Batch Table */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3.5 px-4">Batch Code</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Warehouse Zone</th>
                  <th className="py-3.5 px-4">Stock Packs</th>
                  <th className="py-3.5 px-4">Expiry Date &amp; Horizon</th>
                  <th className="py-3.5 px-4">Moisture</th>
                  <th className="py-3.5 px-4">FEFO Status</th>
                  <th className="py-3.5 px-4 text-right">RBSC Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">No lot batches found.</td>
                  </tr>
                ) : (
                  batches.map((b: any, i: number) => {
                    const expiryInfo = getExpiryInfo(b.expiry_date);
                    const zoneDisplay = typeof b.warehouse_zone === 'object' && b.warehouse_zone !== null 
                      ? (b.warehouse_zone.code || b.warehouse_zone.name || 'N/A') 
                      : (b.warehouse_zone || 'N/A');

                    return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{b.batch_code}</td>
                        <td className="py-3.5 px-4 font-semibold">{b.product?.name || b.product_name || 'N/A'}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">{zoneDisplay}</td>
                        <td className="py-3.5 px-4 font-bold">{b.stock_qty} Packs</td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 block font-bold">{b.expiry_date}</span>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${expiryInfo.badgeClass}`}>
                              {expiryInfo.text}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">{b.moisture_pct}%</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            b.status === 'CRITICAL_EXPIRY_RISK' || b.status === 'EXPIRED'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                              : b.status === 'FEFO_DISPATCH_PRIORITY'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {canEditBatch ? (
                            <button
                              onClick={() => handleOpenEdit(b)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              Edit Lot
                            </button>
                          ) : (
                            <button
                              disabled
                              title="Requires RBSC permission [inventory.edit]"
                              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-400 font-bold rounded-xl text-xs opacity-50 cursor-not-allowed inline-flex items-center gap-1.5 border border-slate-200/50 dark:border-slate-800/50"
                            >
                              <Lock className="w-3.5 h-3.5 text-rose-500" />
                              Locked
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{meta.current_page}</span> of <span className="font-bold text-slate-900 dark:text-white">{meta.last_page}</span> ({meta.total} Total Batches)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1 || loading}
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
              disabled={page >= meta.last_page || loading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create Batch Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Register Incoming FEFO Product Lot
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <SearchableSelect
                  label="Select Chemical / Fertilizer Product"
                  required
                  placeholder="Search chemical catalog by name..."
                  options={productOptions}
                  value={formData.product_id}
                  onChange={handleProductChange}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Batch Lot Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BATCH-NPK-9901"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      value={formData.batch_code}
                      onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Warehouse Zone</label>
                    <div className="relative">
                      <select
                        disabled
                        value={formData.warehouse_zone}
                        className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-slate-500 cursor-not-allowed opacity-80"
                      >
                        {zones.map((z: any) => (
                          <option key={z.id || z.code} value={z.code}>
                            {z.code} - {z.name} ({z.category_type || 'General'})
                          </option>
                        ))}
                      </select>
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Manufactured Date</label>
                    <input
                      type="date"
                      required
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      value={formData.manufactured_date}
                      onChange={(e) => setFormData({ ...formData, manufactured_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Expiration Date</label>
                    <input
                      type="date"
                      required
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Moisture Level (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      value={formData.moisture_pct}
                      onChange={(e) => setFormData({ ...formData, moisture_pct: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Stock Quantity (Packs)</label>
                    <input
                      type="number"
                      required
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-bold"
                      value={formData.stock_qty}
                      onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                  >
                    Register Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Batch Modal */}
        {editingBatch && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Modify Batch Metadata &amp; Stock
                  </h3>
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {editingBatch.batch_code} ({editingBatch.product?.name || editingBatch.product_name})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateBatch} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Batch Stock Packs</label>
                    <input
                      type="number"
                      required
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      value={editFormData.stock_qty}
                      onChange={(e) => setEditFormData({ ...editFormData, stock_qty: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Batch Expiry Date</label>
                    <input
                      type="date"
                      required
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      value={editFormData.expiry_date}
                      onChange={(e) => setEditFormData({ ...editFormData, expiry_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Moisture Level (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      value={editFormData.moisture_pct}
                      onChange={(e) => setEditFormData({ ...editFormData, moisture_pct: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Status Override</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      <option value="SAFE">SAFE</option>
                      <option value="FEFO_DISPATCH_PRIORITY">FEFO DISPATCH PRIORITY</option>
                      <option value="CRITICAL_EXPIRY_RISK">CRITICAL EXPIRY RISK</option>
                      <option value="EXPIRED">EXPIRED</option>
                      <option value="QUARANTINED">QUARANTINED</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingBatch(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Save &amp; Synchronize Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
