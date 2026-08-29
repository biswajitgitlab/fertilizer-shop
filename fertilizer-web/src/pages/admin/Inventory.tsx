import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Product } from '../../types';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_PRODUCT_IMG = 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=300';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const data = await adminApi.getProducts();
      setProducts(data);
    } catch (e) {
      console.error("Inventory error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await adminApi.updateProduct(id, { stock: newStock });
      toast.success("Stock quantity updated!");
      fetchInventory();
    } catch (e) {
      toast.error("Failed to update stock.");
    }
  };

  return (
    <AdminLayout title="Warehouse Inventory Management">
      <div className="space-y-6">
        
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product Image</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Unit Size</th>
                  <th className="py-3.5 px-4">Current Stock</th>
                  <th className="py-3.5 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs text-slate-200 font-medium">
                {products.map((p) => {
                  const imgUrl = Array.isArray(p.images) && p.images[0] ? p.images[0] : (typeof p.images === 'string' ? p.images : DEFAULT_PRODUCT_IMG);
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                          <img
                            src={imgUrl}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform hover:scale-110"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = DEFAULT_PRODUCT_IMG;
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{p.name}</td>
                      <td className="py-3.5 px-4 text-slate-300">{p.category}</td>
                      <td className="py-3.5 px-4 text-slate-400">{p.unit}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                          p.stock > 10
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 inline-flex items-center gap-1'
                        }`}>
                          {p.stock <= 10 && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                          {p.stock} Units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button onClick={() => handleUpdateStock(p.id, p.stock, 10)} className="px-3 py-1.5 bg-slate-950 border border-slate-700 text-emerald-400 font-bold rounded-xl hover:border-emerald-500 transition-all cursor-pointer">
                          +10 Bags
                        </button>
                        <button onClick={() => handleUpdateStock(p.id, p.stock, 50)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-950/50 transition-all cursor-pointer">
                          +50 Bags
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
