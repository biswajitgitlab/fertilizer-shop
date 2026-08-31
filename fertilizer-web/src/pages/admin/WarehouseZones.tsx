import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { apiClient as api } from '../../api/axiosInstances';
import { Warehouse, Plus, Search, Edit2, Trash2, Thermometer, Box, RefreshCw, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const WarehouseZones: React.FC = () => {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category_type: 'Chemical Fertilizers',
    temperature_controlled: false,
    capacity_units: 3000,
  });

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/warehouse-zones');
      setZones(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch warehouse zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleOpenAddModal = () => {
    setEditingZone(null);
    setFormData({
      code: '',
      name: '',
      category_type: 'Chemical Fertilizers',
      temperature_controlled: false,
      capacity_units: 3000,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (zone: any) => {
    setEditingZone(zone);
    setFormData({
      code: zone.code,
      name: zone.name,
      category_type: zone.category_type || '',
      temperature_controlled: Boolean(zone.temperature_controlled),
      capacity_units: zone.capacity_units || 3000,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await api.put(`/admin/warehouse-zones/${editingZone.id}`, formData);
        toast.success(`Warehouse zone ${formData.code} updated!`);
      } else {
        await api.post('/admin/warehouse-zones', formData);
        toast.success(`New warehouse zone ${formData.code} created!`);
      }
      setShowModal(false);
      fetchZones();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save warehouse zone');
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Are you sure you want to delete zone ${code}?`)) return;
    try {
      await api.delete(`/admin/warehouse-zones/${id}`);
      toast.success(`Zone ${code} deleted!`);
      fetchZones();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete zone');
    }
  };

  const filteredZones = zones.filter(z =>
    z.code.toLowerCase().includes(search.toLowerCase()) ||
    z.name.toLowerCase().includes(search.toLowerCase()) ||
    (z.category_type && z.category_type.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout title="Warehouse Storage Zone Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Warehouse className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              Warehouse Zone Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure storage bays, temperature control, and category-level zone assignments
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Storage Zone
            </button>
            <button
              onClick={fetchZones}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search zones by code, name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Zones Table */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3.5 px-4">Zone Code</th>
                  <th className="py-3.5 px-4">Zone Name</th>
                  <th className="py-3.5 px-4">Category Assignment</th>
                  <th className="py-3.5 px-4">Climate Control</th>
                  <th className="py-3.5 px-4">Capacity</th>
                  <th className="py-3.5 px-4">Active Batches</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">Loading warehouse zones...</td>
                  </tr>
                ) : filteredZones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">No storage zones found.</td>
                  </tr>
                ) : (
                  filteredZones.map((z: any) => (
                    <tr key={z.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{z.code}</td>
                      <td className="py-3.5 px-4 font-semibold">{z.name}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">{z.category_type || 'General All Products'}</td>
                      <td className="py-3.5 px-4">
                        {z.temperature_controlled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-300">
                            <Thermometer className="w-3 h-3" />
                            Climate Controlled
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">Ambient Dry</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">{z.capacity_units.toLocaleString()} Units</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                          <Box className="w-3.5 h-3.5 text-emerald-500" />
                          {z.batches_count || 0} Batches
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(z)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Zone"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(z.id, z.code)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Zone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Zone Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {editingZone ? `Edit Warehouse Zone ${editingZone.code}` : 'Add New Warehouse Storage Zone'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Zone Code (Unique Identifier) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ZONE-E"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Zone Title / Descriptive Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. High-Pressure Liquid Spray Bay E"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Product Category</label>
                  <select
                    value={formData.category_type}
                    onChange={(e) => setFormData({ ...formData, category_type: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Chemical Fertilizers">Chemical Fertilizers</option>
                    <option value="Organic &amp; Bio-Fertilizers">Organic &amp; Bio-Fertilizers</option>
                    <option value="Insecticides &amp; Pesticides">Insecticides &amp; Pesticides</option>
                    <option value="Micronutrients &amp; Seeds">Micronutrients &amp; Seeds</option>
                    <option value="General Storage">General Storage</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Capacity (Packs)</label>
                    <input
                      type="number"
                      required
                      value={formData.capacity_units}
                      onChange={(e) => setFormData({ ...formData, capacity_units: Number(e.target.value) })}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <input
                        type="checkbox"
                        checked={formData.temperature_controlled}
                        onChange={(e) => setFormData({ ...formData, temperature_controlled: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Climate Controlled</span>
                    </label>
                  </div>
                </div>

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
                    <span>Save Zone</span>
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

export default WarehouseZones;
