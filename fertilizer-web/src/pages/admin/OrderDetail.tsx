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

  if (isLoading || !order) {
    return <AdminLayout title="Order Details">Loading order info...</AdminLayout>;
  }

  return (
    <AdminLayout title={`Order Details #${order.id}`}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders List</span>
          </Link>

          <InvoiceDownloader order={order} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold border-b pb-3">Purchased Products</h3>
            <div className="space-y-3">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <img src={it.product.images[0]} alt={it.product.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold">{it.product.name}</p>
                      <p className="text-gray-400">Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold">{formatCurrency(it.product.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-2">
              <label className="block text-xs font-bold text-gray-700">Assign Courier Tracking Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. DELHIVERY-890214"
                  value={trackingNo}
                  onChange={(e) => setTrackingNo(e.target.value)}
                  className="flex-1 text-xs bg-gray-50 border rounded-xl px-3 py-2"
                />
                <button onClick={handleSaveTracking} className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4 h-fit text-xs">
            <h3 className="font-bold border-b pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Shipping Info
            </h3>
            <p className="font-bold">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.line1}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="font-bold text-emerald-800">Ph: {order.shippingAddress.phone}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
