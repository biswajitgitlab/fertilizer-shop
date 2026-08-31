import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { apiClient as api } from '../../api/axiosInstances';
import { Product } from '../../types';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, RefreshCw, X, Cpu } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const DEFAULT_PRODUCT_IMG = 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=300';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Server-Side Pagination State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/products', {
        params: {
          page,
          per_page: perPage,
          search: debouncedSearch,
        }
      });

      const raw = res.data;
      if (raw && Array.isArray(raw.data)) {
        setProducts(raw.data);
        setMeta({
          current_page: raw.current_page || page,
          last_page: raw.last_page || 1,
          per_page: raw.per_page || perPage,
          total: raw.total || raw.data.length,
          from: raw.from || (raw.data.length > 0 ? 1 : 0),
          to: raw.to || raw.data.length,
        });
      } else if (Array.isArray(raw)) {
        setProducts(raw);
        setMeta({
          current_page: 1,
          last_page: 1,
          per_page: raw.length,
          total: raw.length,
          from: raw.length > 0 ? 1 : 0,
          to: raw.length,
        });
      } else {
        const fallback = await adminApi.getProducts();
        setProducts(fallback);
        setMeta({ current_page: 1, last_page: 1, per_page: fallback.length, total: fallback.length, from: 1, to: fallback.length });
      }
    } catch (e) {
      console.error("Admin products error:", e);
      toast.error("Failed to load products list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, perPage, debouncedSearch]);

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

  return (
    <AdminLayout title="Product Inventory Catalog">
      <div className="space-y-6">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Product Inventory Catalog</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Redis Cache Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage product SKUs, prices, stock levels, and warehouse allocations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/admin/products/new"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer border border-emerald-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product SKU</span>
            </Link>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search products, crop, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
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

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-500 font-medium">Per Page:</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 font-bold focus:outline-none cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={24}>24 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price / Pack</th>
                  <th className="py-3.5 px-4">Catalog Stock</th>
                  <th className="py-3.5 px-4">NPK Composition</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200 font-medium">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3 px-4"><div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No matching products found in catalog.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const categoryName = typeof p.category === 'object' ? p.category?.name : (p.category || 'Fertilizer');
                    const imageSrc = Array.isArray(p.images_json) && p.images_json[0]
                      ? p.images_json[0]
                      : (Array.isArray(p.images) && p.images[0] ? p.images[0] : (typeof p.images === 'string' ? p.images : DEFAULT_PRODUCT_IMG));
                    const stockVal = Number(p.stock_qty ?? p.stock ?? 0);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={imageSrc}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = DEFAULT_PRODUCT_IMG;
                              }}
                            />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">Unit: {p.unit || 'Pack'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{categoryName}</td>
                        <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">{formatCurrency(p.price)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            stockVal > 10
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                          }`}>
                            {stockVal} units
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {p.npk ? `${p.npk.n}:${p.npk.p}:${p.npk.k}` : 'NPK Standard'}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Link to={`/admin/products/edit/${p.id}`} className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 inline-block transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(String(p.id), p.name)} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server-Side Pagination Controls */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{meta.current_page}</span> of <span className="font-bold text-slate-900 dark:text-white">{meta.last_page}</span> ({meta.total} Total Products)
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

      </div>
    </AdminLayout>
  );
};

export default Products;
