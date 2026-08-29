import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { Order } from '../types';
import { OrderTimeline } from '../components/order/OrderTimeline';
import { InvoiceDownloader } from '../components/order/InvoiceDownloader';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ArrowLeft, Package, MapPin, CreditCard, ShieldCheck } from 'lucide-react';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) return;
        const data = await orderApi.getOrderById(id);
        setOrder(data);
      } catch (e) {
        console.error("Order detail error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return <div className="max-w-4xl mx-auto py-16 text-center animate-pulse">Loading order...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Order not found</h2>
        <Link to="/orders" className="text-emerald-600 font-bold hover:underline">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/orders" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Order #{order.id}</h1>
            <p className="text-xs text-gray-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <InvoiceDownloader order={order} />
      </div>

      {/* Shipment Status Progress */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipment Tracking</h3>
        <OrderTimeline status={order.status} />
        {order.trackingNumber && (
          <p className="text-xs text-center text-gray-600 font-medium pt-2 border-t border-gray-100">
            Courier Tracking Number: <span className="font-bold text-emerald-800">{order.trackingNumber}</span> (Delhivery Logistics)
          </p>
        )}
      </div>

      {/* Items & Shipping Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Purchased Items */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
            Ordered Items ({order.items.length})
          </h3>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{item.product.name}</h4>
                    <p className="text-[11px] text-gray-500">Unit: {item.product.unit} • Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-gray-900">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs text-gray-600 font-medium">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping Fee</span><span>₹{order.shippingFee}</span></div>
            <div className="flex justify-between text-gray-500"><span>GST (18%)</span><span>₹{order.tax}</span></div>
            <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t"><span>Total</span><span className="text-emerald-800">{formatCurrency(order.total)}</span></div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4 h-fit">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Delivery Address
          </h3>
          <div className="text-xs text-gray-700 space-y-1">
            <p className="font-bold text-gray-900">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="font-bold text-emerald-800 pt-1">Phone: {order.shippingAddress.phone}</p>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-1 text-xs">
            <span className="text-gray-400 block font-bold text-[10px] uppercase">Payment</span>
            <p className="font-bold text-gray-900">{order.paymentMethod}</p>
            <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
              {order.paymentStatus}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
