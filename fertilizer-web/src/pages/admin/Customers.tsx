import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Search, Sprout, ShoppingBag, Stethoscope, Phone, Mail, MapPin, Eye, CheckCircle, XCircle, RefreshCw, Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CustomerRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  farm_location?: string;
  farm_size_acres?: number;
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
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetailData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [inspectingId, setInspectingId] = useState<number | string | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCustomers({ search });
      if (res?.data) {
        setCustomers(res.data);
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
  }, [search]);

  const handleInspectCustomer = async (c: CustomerRecord) => {
    setInspectingId(c.id);
    try {
      const data = await adminApi.getCustomerDetails(c.id);
      setSelectedCustomer(data);
      setShowDetailModal(true);
    } catch (e) {
      toast.error("Failed to fetch customer profile.");
    } finally {
      setInspectingId(null);
    }
  };

  return (
    <AdminLayout title="Registered Farmer & Customer CRM">
      <div className="space-y-6">

        {/* Header Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
              <Sprout className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Farmer Network &amp; Buyer Directory</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Storefront buyers, farm locations, acreage holding, and order history metrics.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchCustomers}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title="Refresh Customer CRM"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl">
              {customers.length} Registered Farmers
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search farmer name, phone, or region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
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
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Loading farmer directory...</td>
                  </tr>
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

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1 mt-2.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.farm_location || 'Default Region'}</span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {c.farm_size_acres ? `${c.farm_size_acres} Acres` : 'N/A'}
                      </td>

                      <td className="py-3.5 px-4">
                        {c.is_verified ? (
                          <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
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

        {/* Farmer Profile Detail Drawer Modal */}
        {showDetailModal && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl animate-scale-in text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center font-black text-lg uppercase shrink-0">
                    {selectedCustomer.customer.name ? selectedCustomer.customer.name[0] : 'F'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{selectedCustomer.customer.name || 'Farmer'}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{selectedCustomer.customer.email} • {selectedCustomer.customer.phone || 'No phone'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold shrink-0 p-1"
                >
                  ✕
                </button>
              </div>

              {/* CRM Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                  <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Orders</p>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{selectedCustomer.stats.orders_count}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                  <Sprout className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Spend</p>
                  <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">₹{Number(selectedCustomer.stats.total_spent || 0).toLocaleString('en-IN')}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                  <Stethoscope className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Diagnoses</p>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{selectedCustomer.stats.crop_diagnoses_count}</p>
                </div>
              </div>

              {/* Farm Profile Information */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <p className="font-bold text-slate-700 dark:text-slate-300">Farm Location: <span className="font-medium text-slate-900 dark:text-white">{selectedCustomer.customer.farm_location || 'Not Specified'}</span></p>
                <p className="font-bold text-slate-700 dark:text-slate-300">Land Holding: <span className="font-medium text-slate-900 dark:text-white">{selectedCustomer.customer.farm_size_acres ? `${selectedCustomer.customer.farm_size_acres} Acres` : 'Not Specified'}</span></p>
                <p className="font-bold text-slate-700 dark:text-slate-300">Account Registered: <span className="font-medium text-slate-900 dark:text-white">{new Date(selectedCustomer.customer.created_at).toLocaleDateString('en-IN')}</span></p>
              </div>

              {/* Recent Orders Section */}
              {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Recent Orders</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedCustomer.orders.map((o: any, idx: number) => (
                      <div key={o.id || idx} className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Order #{o.order_number || o.id}</p>
                          <p className="text-[10px] text-slate-400">{new Date(o.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-600 dark:text-emerald-400">₹{Number(o.total || 0).toLocaleString('en-IN')}</p>
                          <span className="text-[9px] uppercase font-extrabold text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {o.status || 'PENDING'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
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
