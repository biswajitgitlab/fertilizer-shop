import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getOrders({ status: statusFilter });
      setOrders(res.orders);
    } catch (e) {
      console.error("Admin orders error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

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
        
        {/* Status Filter Tabs */}
        <div className="flex border border-slate-200/80 dark:border-slate-800/80 gap-3 overflow-x-auto text-xs font-bold bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl shadow-sm dark:shadow-xl">
          {['', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`pb-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
                statusFilter === st
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-black shadow-sm'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              {st === '' ? 'All Orders' : st}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Change Status</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200 font-medium">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
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
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 cursor-pointer"
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
