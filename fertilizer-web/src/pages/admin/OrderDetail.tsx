import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceDownloader } from '../../components/order/InvoiceDownloader';
import { ArrowLeft, MapPin, CheckCircle, Clock, Package, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '../../store/authStore';
import { echo } from '../../utils/echo';

export const OrderDetail: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const isDriver = (user?.role || '').toLowerCase().includes('driver') || (user?.roles || []).some((r: any) => (typeof r === 'string' ? r : r.name).toLowerCase().includes('driver'));
  const isSuperAdminOrAdmin = ['super admin', 'admin', 'superadmin'].includes((user?.role || '').toLowerCase());
  const canShip = isDriver || isSuperAdminOrAdmin;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingNo, setTrackingNo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const data = await adminApi.getOrderById(id);
      setOrder(data);
      if (data.trackingNumber) setTrackingNo(data.trackingNumber);
    } catch (e) {
      console.error("Admin getOrderById error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    if (!id) return;

    const channelName = `orders.${id}`;
    const channel = echo.channel(channelName);
    
    channel.listen('.OrderStatusUpdated', () => {
      fetchOrder();
    });

    return () => {
      channel.stopListening('.OrderStatusUpdated');
      echo.leaveChannel(channelName);
    };
  }, [id]);

  const handleSaveTracking = async () => {
    if (!order || isUpdating) return;
    setIsUpdating(true);
    try {
      await adminApi.updateOrderStatus(order.id, order.status, trackingNo);
      toast.success("Order fulfillment saved!");
      await fetchOrder();
    } catch (e) {
      toast.error("Failed to update order details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order || isUpdating) return;
    const currentStatusNormalized = (order.status || '').toUpperCase().replace(/ /g, '_');
    const newStatusNormalized = newStatus.toUpperCase().replace(/ /g, '_');

    if (currentStatusNormalized === newStatusNormalized) {
      toast.error(`Order is already in ${order.status} status.`);
      return;
    }

    setIsUpdating(true);
    try {
      await adminApi.updateOrderStatus(order.id, newStatus, trackingNo);
      toast.success(`Status updated to ${newStatus}${newStatus === 'Delivered' ? ' & Payment Collected' : ''}!`);
      await fetchOrder();
    } catch (e) {
      toast.error("Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Order Details">
        <div className="p-12 text-center text-xs font-bold text-slate-500 animate-pulse">
          Loading order details...
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order Details">
        <div className="max-w-md mx-auto py-12 text-center space-y-4 bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center font-black text-lg">!</div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Order Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">The requested order standard #{id} could not be located in database records.</p>
          <Link to="/admin/orders" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md">
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
          <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders List</span>
          </Link>

          <InvoiceDownloader order={order} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>Purchased Products</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-wider flex items-center gap-1.5">
                {(() => {
                  const s = (order.status || '').toUpperCase();
                  if (s === 'PENDING' || s === 'CONFIRMED') return <Clock className="w-3 h-3 animate-pulse text-amber-500" />;
                  if (s === 'PACKED' || s === 'PROCESSING' || s === 'READY_FOR_PICKUP') return <Package className="w-3 h-3 animate-pulse text-blue-500" />;
                  if (s === 'SHIPPED') return <Truck className="w-3 h-3 animate-bounce text-purple-500" />;
                  if (s === 'OUT FOR DELIVERY' || s === 'OUT_FOR_DELIVERY') return <MapPin className="w-3 h-3 animate-bounce text-emerald-500" />;
                  if (s === 'DELIVERED') return <CheckCircle className="w-3 h-3 animate-bounce text-emerald-500" />;
                  return null;
                })()}
                {order.status}
              </span>
            </h3>
            <div className="space-y-3">
              {order.items.map((it, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <img src={it.product.images[0]} alt={it.product.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{it.product.name}</p>
                        <p className="text-slate-500 dark:text-slate-400">Quantity: <span className="font-bold text-slate-900 dark:text-white">{it.quantity} pack(s)</span></p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(it.product.price * it.quantity)}</span>
                  </div>

                  {/* Warehouse Worker FEFO Picking Location Badge */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">📦 Pick Location:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                        {(it as any).warehouse_zone || (it as any).warehouseZone || 'ZONE-A'}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                      FEFO Lot Batch: <strong className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">{(it as any).assigned_batch || (it as any).batch_code || 'AUTO-BATCH'}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>



            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              {/* Sequential Operational Workflow Progress Bar */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">⚡ Fulfillment Workflow Actions</h4>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    Current: <span className="text-slate-900 dark:text-white font-black">{order.status}</span>
                    {(() => {
                      const s = (order.status || '').toUpperCase();
                      if (s === 'PENDING' || s === 'CONFIRMED') return <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" />;
                      if (s === 'PACKED' || s === 'PROCESSING' || s === 'READY_FOR_PICKUP') return <Package className="w-3.5 h-3.5 animate-pulse text-blue-500" />;
                      if (s === 'SHIPPED') return <Truck className="w-3.5 h-3.5 animate-bounce text-purple-500" />;
                      if (s === 'OUT FOR DELIVERY' || s === 'OUT_FOR_DELIVERY') return <MapPin className="w-3.5 h-3.5 animate-bounce text-emerald-500" />;
                      if (s === 'DELIVERED') return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
                      return null;
                    })()}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { level: 1, label: '1. Warehouse Packed', action: 'Packed', disabled: isDriver },
                    { level: 2, label: '2. Shipped / In Transit', action: 'Shipped', disabled: !canShip },
                    { level: 3, label: '3. Out for Delivery', action: 'Out for Delivery', disabled: false },
                    { level: 4, label: '4. Delivered & Paid', action: 'Delivered', disabled: false },
                  ].map((btn) => {
                    const s = (order.status || '').toUpperCase().replace(/ /g, '_');
                    let currentLevel = 0;
                    if (['DELIVERED'].includes(s)) currentLevel = 4;
                    else if (['OUT_FOR_DELIVERY'].includes(s)) currentLevel = 3;
                    else if (['SHIPPED'].includes(s)) currentLevel = 2;
                    else if (['PACKED', 'PROCESSING', 'READY_FOR_PICKUP'].includes(s)) currentLevel = 1;
                    
                    const isDone = currentLevel > btn.level;
                    const isActive = currentLevel === btn.level;
                    const isAlreadyCurrentOrPast = currentLevel >= btn.level;
                    const isDisabled = btn.disabled || isUpdating || isAlreadyCurrentOrPast;
                    
                    let buttonClass = '';
                    if (isActive) {
                      buttonClass = 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/50';
                    } else if (isDone) {
                      buttonClass = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
                    } else {
                      buttonClass = 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:border-emerald-500 cursor-pointer';
                    }

                    return (
                      <button
                        key={btn.level}
                        onClick={() => handleStatusChange(btn.action)}
                        disabled={isDisabled}
                        title={isActive ? `Order is currently ${order.status}` : isDone ? `Completed stage` : `Advance order status to ${btn.action}`}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${buttonClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        <span className="flex items-center justify-center gap-1">
                          {isDone && <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />}
                          {btn.label}
                          {isActive && <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-white/20 ml-1">Current</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-4 h-fit text-xs text-slate-700 dark:text-slate-300">
            <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Shipping Info
            </h3>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{order.shippingAddress?.name || order.customerName || 'Valued Customer'}</p>
            <p className="text-slate-500 dark:text-slate-400">{order.shippingAddress?.line1 || 'N/A'}</p>
            <p className="text-slate-500 dark:text-slate-400">{[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ')}{order.shippingAddress?.pincode ? ` - ${order.shippingAddress.pincode}` : ''}</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 pt-1">Ph: {order.shippingAddress?.phone || order.phone || 'N/A'}</p>

            {/* Assigned Staff Summary Box */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider">Assigned Operations Staff</h4>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Packer:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{order.packer?.name || (order as any).packer_name || order.packerName || 'Not Assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{order.driver?.name || (order as any).driver_name || order.driverName || 'Not Assigned'}</span>
                </div>
              </div>
            </div>

            {/* Order Financial Summary */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 mt-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider">Payment Summary</h4>
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Shipping & Handling</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(order.shippingCost ?? order.shippingFee ?? (order as any).shipping_fee ?? 0)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Tax</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(order.tax || 0)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-rose-500 dark:text-rose-400">
                    <span>Discount {(order as any).coupon_code || (order as any).couponCode ? `(${(order as any).coupon_code || (order as any).couponCode})` : ''}</span>
                    <span className="font-medium">-{formatCurrency(order.discount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-emerald-200/50 dark:border-emerald-800/50">
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Grand Total</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{formatCurrency(order.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
