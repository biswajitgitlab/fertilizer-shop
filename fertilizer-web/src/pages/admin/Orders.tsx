import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Search, ShoppingBag } from 'lucide-react';
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
        <div className="flex border-b border-gray-200 gap-4 overflow-x-auto text-xs font-bold bg-white p-4 rounded-2xl">
          {['', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`pb-1 transition-colors cursor-pointer border-b-2 ${
                statusFilter === st ? 'border-emerald-600 text-emerald-800 font-black' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {st === '' ? 'All Orders' : st}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Change Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-800 font-medium">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-bold text-gray-900">#{ord.id}</td>
                    <td className="py-3.5 px-4 font-semibold">{ord.shippingAddress.name} ({ord.shippingAddress.phone})</td>
                    <td className="py-3.5 px-4 text-gray-500">{formatDate(ord.createdAt)}</td>
                    <td className="py-3.5 px-4 font-black text-gray-900">{formatCurrency(ord.total)}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-800 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/admin/orders/${ord.id}`} className="text-emerald-600 hover:underline font-bold">
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
