import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { apiClient as api } from '../../api/axiosInstances';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { PackageCheck, Plus, RefreshCw, Layers, Calendar, Warehouse, Save, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export const Batches: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
        api.get('/admin/batches'),
        api.get('/products'),
        api.get('/admin/warehouse-zones'),
      ]);
      setBatches(batchRes.data || []);
      setProducts(prodRes.data.data || prodRes.data || []);
      setZones(zoneRes.data || []);
    } catch (err) {
      console.error('Failed to fetch batches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <PackageCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              FEFO Product Batch Manager
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Lot-level shelf-life tracking &amp; moisture analysis for FEFO inventory dispatch
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Lot Batch
            </button>
            <button
              onClick={fetchData}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Batch Table */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3.5 px-4">Batch Code</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Warehouse Zone</th>
                  <th className="py-3.5 px-4">Stock Pack Qty</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Moisture Level</th>
                  <th className="py-3.5 px-4">FEFO Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">Loading product batches...</td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">No lot batches registered.</td>
                  </tr>
                ) : (
                  batches.map((b: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{b.batch_code}</td>
                      <td className="py-3.5 px-4 font-semibold">{b.product?.name || b.product_name || 'N/A'}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">{b.warehouse_zone}</td>
                      <td className="py-3.5 px-4 font-bold">{b.stock_qty} Packs</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{b.expiry_date}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">{b.moisture_pct}%</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          b.status === 'CRITICAL_EXPIRY_RISK'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                            : b.status === 'FEFO_DISPATCH_PRIORITY'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Batch Modal with Searchable Select */}
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
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                {/* Searchable Product Select */}
                <SearchableSelect
                  label="Select Chemical / Fertilizer Product"
                  required
                  options={productOptions}
                  value={formData.product_id}
                  onChange={(val) => handleProductChange(String(val))}
                  placeholder="Type product name to search catalog..."
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Batch Lot Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BATCH-2026-UREA-01"
                    value={formData.batch_code}
                    onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Manufacture Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.manufactured_date}
                      onChange={(e) => setFormData({ ...formData, manufactured_date: e.target.value })}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Moisture % *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.moisture_pct}
                      onChange={(e) => setFormData({ ...formData, moisture_pct: e.target.value })}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Stock Packs *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock_qty}
                      onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Auto-Assigned Un-Editable Warehouse Zone Dropdown */}
                <SearchableSelect
                  label="Warehouse Storage Zone (Auto-Assigned)"
                  disabled
                  options={zones.map(z => ({
                    value: z.code,
                    label: `${z.code} - ${z.name}`,
                    sublabel: z.category_type ? `Category: ${z.category_type}` : undefined
                  }))}
                  value={formData.warehouse_zone}
                  onChange={() => {}}
                  placeholder="Select warehouse storage zone..."
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Batch Lot</span>
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

export default Batches;
