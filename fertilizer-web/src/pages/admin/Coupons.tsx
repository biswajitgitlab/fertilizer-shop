import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Tag, Trash2, UserCheck } from 'lucide-react';
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

  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'PERCENT' | 'FIXED'>('FIXED');
  const [newValue, setNewValue] = useState('');
  const [newMinOrder, setNewMinOrder] = useState('499');
  const [isNewCustomerOnly, setIsNewCustomerOnly] = useState(false);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/coupons');
      if (res.data && res.data.data) {
        setCoupons(res.data.data);
      } else if (Array.isArray(res.data)) {
        setCoupons(res.data);
      }
    } catch (err) {
      try {
        const publicRes = await apiClient.get('/coupons/public');
        setCoupons(publicRes.data || []);
      } catch (e) {
        console.error("Failed to load coupons", e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

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
        
        {/* Create Coupon Card */}
        <form onSubmit={handleAddCoupon} className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4 text-slate-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Create New Promo Token</h3>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-semibold">
              Live DB Synchronized
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Coupon Code</label>
              <input
                type="text"
                placeholder="e.g. NEWFARMER"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 uppercase font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Discount Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-bold text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="FIXED" className="bg-slate-900">Flat Amount (₹)</option>
                <option value="PERCENT" className="bg-slate-900">Percentage (%)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Discount Value</label>
              <input
                type="number"
                placeholder={newType === 'FIXED' ? 'e.g. 150' : 'e.g. 10'}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-bold text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Min. Order Subtotal (₹)</label>
              <input
                type="number"
                placeholder="e.g. 499"
                value={newMinOrder}
                onChange={(e) => setNewMinOrder(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-bold text-white focus:outline-none focus:border-emerald-500"
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
              className="w-4 h-4 text-emerald-500 rounded cursor-pointer bg-slate-950 border-slate-800"
            />
            <label htmlFor="newCustomerOnly" className="text-xs font-bold text-slate-300 cursor-pointer flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Exclusive to First-Time Customers Only (0 previous orders)</span>
            </label>
          </div>

          <button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition-all">
            Publish Token Code
          </button>
        </form>

        {/* Coupons List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/60 rounded-3xl border border-slate-800">No active coupons found.</div>
          ) : (
            coupons.map((c) => (
              <div key={c.id || c.code} className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-mono font-black text-white">{c.code}</h4>
                      {c.is_new_customer_only && (
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-purple-400" />
                          New Customer Only
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Min. Order: ₹{c.min_order} • Expires: {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : 'No Expiry'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full">
                    {c.type === 'PERCENT' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                  </span>
                  <button onClick={() => handleDelete(c.id)} className="text-slate-500 hover:text-rose-400 cursor-pointer p-1 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </AdminLayout>
  );
};
