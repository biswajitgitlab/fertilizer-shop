import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { apiClient as api } from '../../api/axiosInstances';
import { Product } from '../../types';
import {
  AlertTriangle, Boxes, Search, X, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_PRODUCT_IMG = 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=300';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Pagination State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/inventory', {
        params: { page, per_page: perPage, search }
      });
      const raw = res.data;
      const rawList = raw && Array.isArray(raw.data) ? raw.data : (Array.isArray(raw) ? raw : []);
      if (rawList.length > 0) {
        const mappedProducts: Product[] = rawList.map((item: any) => ({
          id: String(item.id),
          name: item.name,
          slug: item.slug || '',
          category: typeof item.category === 'object' ? item.category?.name : (item.category || 'Fertilizer'),
          categorySlug: 'fertilizer',
          price: Number(item.price || 0),
          unit: item.unit || 'Pack',
          stock: Number(item.stock_qty ?? item.stock ?? 0),
          rating: 5,
          reviewsCount: 0,
          images: item.images_json || [DEFAULT_PRODUCT_IMG],
          suitableCrops: [],
          shortDescription: '',
          description: '',
          usageInstructions: '',
          sku: item.sku || 'SKU'
        }));
        setProducts(mappedProducts);
        setMeta(raw.meta || { current_page: page, last_page: Math.max(1, Math.ceil(mappedProducts.length / perPage)), per_page: perPage, total: mappedProducts.length });
      } else {
        setProducts([]);
        setMeta({ current_page: 1, last_page: 1, per_page: perPage, total: 0 });
      }
    } catch (e) {
      console.error("Inventory error:", e);
      toast.error("Failed to load inventory stock");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, perPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchInventory();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <AdminLayout title="Warehouse Inventory Overview">
      <div className="space-y-6">
        
        {/* Filter Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search product catalog by name..."
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

          <div className="flex items-center gap-2">
            <button
              onClick={fetchInventory}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
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

        {/* Inventory Table */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
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
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3 px-4"><div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 ml-auto"></div></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">No products found in inventory.</td>
                  </tr>
                ) : (
                  products.map((p) => {
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server-Side Pagination Bar */}
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
