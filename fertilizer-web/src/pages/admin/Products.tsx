import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Product } from '../../types';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getProducts();
      setProducts(data);
    } catch (e) {
      console.error("Admin products error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await adminApi.deleteProduct(id);
        toast.success(`Deleted ${name}`);
        fetchProducts();
      } catch (e) {
        toast.error("Failed to delete product.");
      }
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Product Inventory Catalog">
      <div className="space-y-6">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search products, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          </div>

          <Link
            to="/admin/products/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer border border-emerald-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product SKU</span>
          </Link>
        </div>

        {/* Products Table */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price / Pack</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">NPK Ratio</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200 font-medium">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || 'https://via.placeholder.com/150'} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Unit: {p.unit}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{p.category}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">{formatCurrency(p.price)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.stock > 10
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {p.npk ? `${p.npk.n}:${p.npk.p}:${p.npk.k}` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link to={`/admin/products/edit/${p.id}`} className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 inline-block transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
