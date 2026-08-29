import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceDownloader } from '../../components/order/InvoiceDownloader';
import { ArrowLeft, MapPin, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingNo, setTrackingNo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) return;
        const data = await adminApi.getOrderById(id);
        setOrder(data);
        if (data.trackingNumber) setTrackingNo(data.trackingNumber);
      } catch (e) {
        console.error("Admin order detail error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleSaveTracking = async () => {
    if (!order) return;
    try {
      await adminApi.updateOrderStatus(order.id, order.status, trackingNo);
      toast.success("Courier tracking number updated!");
    } catch (e) {
      toast.error("Failed to update tracking.");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Order Details">
        <div className="p-12 text-center text-xs font-bold text-slate-400 animate-pulse">
          Loading order details...
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order Details">
        <div className="max-w-md mx-auto py-12 text-center space-y-4 bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 border border-slate-800 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center font-black text-lg">!</div>
          <h2 className="text-base font-bold text-white">Order Not Found</h2>
          <p className="text-xs text-slate-400">The requested order standard #{id} could not be located in database records.</p>
          <Link to="/admin/orders" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-950/50">
            Back to Orders List
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Order Details #${order.id}`}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders List</span>
          </Link>

          <InvoiceDownloader order={order} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Purchased Products</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                {order.status}
              </span>
            </h3>
            <div className="space-y-3">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-3 rounded-2xl bg-slate-950/40 border border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <img src={it.product.images[0]} alt={it.product.name} className="w-10 h-10 rounded-xl object-cover border border-slate-800" />
                    <div>
                      <p className="font-bold text-white">{it.product.name}</p>
                      <p className="text-slate-400">Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400">{formatCurrency(it.product.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300">Assign Courier Tracking Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. DELHIVERY-890214"
                  value={trackingNo}
                  onChange={(e) => setTrackingNo(e.target.value)}
                  className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <button onClick={handleSaveTracking} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-950/50 cursor-pointer">
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-3 h-fit text-xs text-slate-300">
            <h3 className="font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Shipping Info
            </h3>
            <p className="font-bold text-white text-sm">{order.shippingAddress?.name || order.customerName || 'Valued Customer'}</p>
            <p className="text-slate-400">{order.shippingAddress?.line1 || 'N/A'}</p>
            <p className="text-slate-400">{[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ')}{order.shippingAddress?.pincode ? ` - ${order.shippingAddress.pincode}` : ''}</p>
            <p className="font-bold text-emerald-400 pt-1">Ph: {order.shippingAddress?.phone || order.phone || 'N/A'}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
