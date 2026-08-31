import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Search, X, RefreshCw, ChevronLeft, ChevronRight, Cpu, ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Search State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getOrders({
        page,
        per_page: perPage,
        status: statusFilter,
        search
      });
      setOrders(res.orders || []);
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (e) {
      console.error("Admin orders error:", e);
      toast.error("Failed to fetch order records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, perPage, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
    } catch (e) {
      toast.error("Failed to update status.");
    }
  };

  return (
    <AdminLayout title="Fulfillment & Order Management">
      <div className="space-y-6">
        
        {/* Header Title with Redis Telemetry */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                Fulfillment &amp; Order Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Redis Cache Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live customer orders, payment status, and dispatch tracking
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Order ID, farmer name, tracking..."
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

        {/* Status Filter Tabs */}
        <div className="flex border border-emerald-200/70 dark:border-emerald-500/20 gap-3 overflow-x-auto text-xs font-bold bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl shadow-sm dark:shadow-xl">
          {['', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`pb-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
                statusFilter === st
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-black shadow-xs'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              {st === '' ? 'All Orders' : st}
            </button>
          ))}
        </div>

        {/* Orders Container: Mobile Cards (sm:hidden) & Desktop Table (hidden sm:block) */}
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-emerald-200/70 dark:border-emerald-500/20 shadow-sm dark:shadow-xl overflow-hidden">
          
          {/* Mobile Orders Card View (Visible under sm) */}
          <div className="block sm:hidden divide-y divide-emerald-100/60 dark:divide-slate-800/50">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading order records...</div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No orders found matching filter.</div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="p-4 space-y-3 hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">#{ord.id}</span>
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {ord.shippingAddress?.name || ord.customerName || (ord as any).user?.name || 'Valued Customer'}
                      </p>
                    </div>

                    <span className="text-sm font-black text-slate-900 dark:text-white shrink-0">
                      {formatCurrency(ord.total)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs bg-emerald-50/50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Placed On</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(ord.createdAt)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block text-right">Status</span>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-emerald-300/80 dark:border-emerald-700/80 rounded-xl px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                      >
                        <option value="Pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pending</option>
                        <option value="Confirmed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Confirmed</option>
                        <option value="Packed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Packed</option>
                        <option value="Shipped" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Shipped</option>
                        <option value="Delivered" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Delivered</option>
                        <option value="Cancelled" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <Link
                      to={`/admin/orders/${ord.id}`}
                      className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                    >
                      Inspect Order Details →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Orders Table View (Hidden under sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50/60 dark:bg-emerald-950/40 border-b border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Change Status</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/50 dark:divide-slate-800/40 text-xs text-slate-800 dark:text-slate-200 font-medium">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">No order records found.</td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">#{ord.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {ord.shippingAddress?.name || ord.customerName || (ord as any).user?.name || 'Valued Customer'}
                        {(ord.shippingAddress?.phone || ord.phone || (ord as any).user?.phone) ? ` (${ord.shippingAddress?.phone || ord.phone || (ord as any).user?.phone})` : ''}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{formatDate(ord.createdAt)}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">{formatCurrency(ord.total)}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-emerald-300/80 dark:border-emerald-700/80 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                        >
                          <option value="Pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pending</option>
                          <option value="Confirmed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Confirmed</option>
                          <option value="Packed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Packed</option>
                          <option value="Shipped" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Shipped</option>
                          <option value="Delivered" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Delivered</option>
                          <option value="Cancelled" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link to={`/admin/orders/${ord.id}`} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold transition-colors">
                          View Order
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{meta.current_page}</span> of <span className="font-bold text-slate-900 dark:text-white">{meta.last_page}</span> ({meta.total} Total Orders)
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
