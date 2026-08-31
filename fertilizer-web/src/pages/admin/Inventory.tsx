import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Product } from '../../types';
import { AlertTriangle, Boxes, Info } from 'lucide-react';

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

  return (
    <AdminLayout title="Warehouse Inventory Overview">
      <div className="space-y-6">
        
        {/* Compliance Guidance Banner */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 text-xs leading-relaxed font-medium">
          <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-emerald-900 dark:text-emerald-200 block mb-0.5">Strict Batch Compliance Active</strong>
            Inventory stock is synchronized automatically with warehouse batch lots. Inbound inventory restocks must be registered through the <Link to="/admin/batches" className="underline font-bold hover:text-emerald-600">Batch Management Module</Link> with mandatory Lot Code, Expiry Date, Moisture %, and Warehouse Storage Zone data.
          </div>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product Image</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Unit Size</th>
                  <th className="py-3.5 px-4">Catalog Stock</th>
                  <th className="py-3.5 px-4 text-right">Batch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200 font-medium">
                {products.map((p) => {
                  const imgUrl = Array.isArray(p.images) && p.images[0] ? p.images[0] : (typeof p.images === 'string' ? p.images : DEFAULT_PRODUCT_IMG);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0">
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
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{p.category}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{p.unit}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                          p.stock > 10
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 inline-flex items-center gap-1'
                        }`}>
                          {p.stock <= 10 && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                          {p.stock} Units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link 
                          to="/admin/batches" 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          Manage Batches
                        </Link>
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
