import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Tag, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState([
    { code: 'KRISHI10', discount: 10, type: 'percent', description: '10% OFF on all NPK Chemical Fertilizers' },
    { code: 'FARMER100', discount: 100, type: 'flat', description: 'Flat ₹100 OFF on orders above ₹500' },
    { code: 'ORGANIC20', discount: 20, type: 'percent', description: '20% OFF on Vermicompost and Bio-Stimulants' }
  ]);

  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newDiscount) return;
    setCoupons([
      ...coupons,
      { code: newCode.toUpperCase(), discount: Number(newDiscount), type: 'percent', description: newDesc || 'Discount Coupon' }
    ]);
    toast.success(`Coupon ${newCode.toUpperCase()} added!`);
    setNewCode('');
    setNewDiscount('');
    setNewDesc('');
  };

  const handleDelete = (code: string) => {
    setCoupons(coupons.filter(c => c.code !== code));
    toast.success(`Deleted coupon ${code}`);
  };

  return (
    <AdminLayout title="Discount Coupons & Promotional Offers">
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Create Coupon Card */}
        <form onSubmit={handleAddCoupon} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Create New Promo Code</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Coupon Code (e.g. KISAN15)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="text-xs bg-gray-50 border rounded-xl px-3.5 py-2 uppercase font-bold"
              required
            />
            <input
              type="number"
              placeholder="Discount %"
              value={newDiscount}
              onChange={(e) => setNewDiscount(e.target.value)}
              className="text-xs bg-gray-50 border rounded-xl px-3.5 py-2 font-bold"
              required
            />
            <input
              type="text"
              placeholder="Description..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="text-xs bg-gray-50 border rounded-xl px-3.5 py-2"
            />
          </div>
          <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer">
            Publish Coupon
          </button>
        </form>

        {/* Coupons List */}
        <div className="space-y-3">
          {coupons.map((c) => (
            <div key={c.code} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">{c.code}</h4>
                  <p className="text-xs text-gray-500">{c.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                  {c.discount}% OFF
                </span>
                <button onClick={() => handleDelete(c.code)} className="text-gray-400 hover:text-rose-600 cursor-pointer p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
};
