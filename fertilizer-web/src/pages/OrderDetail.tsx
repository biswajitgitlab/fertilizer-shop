import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { Order } from '../types';
import { OrderTimeline } from '../components/order/OrderTimeline';
import { InvoiceDownloader } from '../components/order/InvoiceDownloader';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ArrowLeft, Package, MapPin, CreditCard, ShieldCheck, XCircle, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { PaymentModal } from '../components/checkout/PaymentModal';

const normalizeOrder = (raw: any): Order | null => {
  if (!raw) return null;
  const o = raw.order || raw;
  const addr = o.shipping_address_json || o.shippingAddress || {};

  const rawItems: any[] = o.items || [];
  const normalizedItems = rawItems.map((item: any) => {
    const prod = item.product || {};
    const img = prod.images_json?.[0] || prod.images?.[0] || prod.image || item.image || '/placeholder.png';
    return {
      product: {
        id: String(prod.id || item.product_id || ''),
        name: prod.name || item.name || 'Fertilizer Product',
        slug: prod.slug || item.slug || '',
        category: prod.category || 'Fertilizer',
        categorySlug: prod.category_slug || 'fertilizer',
        price: Number(item.unit_price || item.price || prod.price || 0),
        unit: prod.unit || item.unit || 'Pack',
        stock: prod.stock || 100,
        rating: prod.rating || 5,
        reviewsCount: prod.reviews_count || 0,
        images: [img],
        suitableCrops: prod.suitable_crops_json || prod.suitableCrops || [],
        shortDescription: prod.short_description || '',
        description: prod.description || '',
        usageInstructions: prod.usage_instructions || '',
        sku: prod.sku || 'SKU'
      },
      quantity: Number(item.qty || item.quantity || 1)
    };
  });

  const pm = o.payment_method || o.paymentMethod || 'COD';
  const paymentMethod = (pm === 'COD' || pm === 'Cash on Delivery') ? 'Cash on Delivery' : 'Online Payment';
  const ps = o.payment_status || o.paymentStatus || 'PENDING';
  const paymentStatus = (ps === 'PAID' || ps === 'Paid') ? 'Paid' : (ps === 'FAILED' ? 'Failed' : 'Pending');

  const pObj = o.payment || raw.payment || null;
  const paymentDetails = pObj ? {
    gateway: pObj.gateway || 'RAZORPAY',
    transactionId: pObj.transaction_id || 'N/A',
    status: pObj.status || ps,
    date: pObj.created_at || o.updated_at
  } : null;

  return {
    id: String(o.order_number || o.id || 'N/A'),
    numericId: o.id,
    userId: String(o.user_id || o.userId || ''),
    customerName: addr.name || 'Customer',
    phone: addr.phone || '',
    shippingAddress: {
      name: addr.name || 'Customer',
      phone: addr.phone || '',
      line1: addr.line1 || 'N/A',
      line2: addr.line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || ''
    },
    items: normalizedItems,
    subtotal: Number(o.subtotal || 0),
    shippingFee: Number(o.shipping_cost ?? o.shippingFee ?? 0),
    tax: Number(o.tax || 0),
    discount: Number(o.discount || 0),
    total: Number(o.total || 0),
    paymentMethod,
    paymentStatus,
    paymentDetails,
    status: o.status || 'Pending',
    trackingNumber: o.tracking_number || o.trackingNumber || `DEL${o.id}99`,
    createdAt: o.created_at || o.createdAt || new Date().toISOString(),
    cancelledAt: o.cancelled_at || o.cancelledAt,
    cancelledBy: o.cancelled_by || o.cancelledBy,
    cancellationReason: o.cancellation_reason || o.cancellationReason,
    refundStatus: o.refund_status || o.refundStatus,
    refundAmount: Number(o.refund_amount || o.refundAmount || 0),
    refundReferenceId: o.refund_reference_id || o.refundReferenceId
  };
};

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('Changed mind / No longer needed');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const targetId = order.numericId || order.id;
      await orderApi.cancelOrder(targetId, cancellationReason);
      setShowCancelModal(false);
      await fetchOrder();
    } catch (e: any) {
      setCancelError(e.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const fetchOrder = async () => {
    try {
      if (!id) return;
      const data = await orderApi.getOrderById(id);
      const normalized = normalizeOrder(data);
      setOrder(normalized);
    } catch (e) {
      console.error("Order detail error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Auto-poll status every 4 seconds if payment is pending (for 30 seconds max)
    let intervalId: any = null;
    let pollCount = 0;

    if (order?.paymentStatus !== 'Paid' && order?.paymentMethod === 'Online Payment') {
      intervalId = setInterval(() => {
        pollCount++;
        fetchOrder();
        if (pollCount >= 8) {
          clearInterval(intervalId);
        }
      }, 4000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id, order?.paymentStatus]);

  const handleVerifyPaymentStatus = async () => {
    if (!id) return;
    setIsVerifying(true);
    try {
      await orderApi.verifyPayment(id);
      await fetchOrder();
    } catch (e) {
      console.error("Verify payment error:", e);
    } finally {
      setIsVerifying(false);
    }
  };

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
          <Link to="/orders" className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl text-gray-700 dark:text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Order #{order.id}</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <InvoiceDownloader order={order} />
      </div>

      {/* Shipment Status Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Shipment Tracking</h3>
        <OrderTimeline status={order.status} />
        {order.trackingNumber && (
          <p className="text-xs text-center text-gray-600 dark:text-slate-400 font-medium pt-2 border-t border-gray-100 dark:border-slate-800">
            Courier Tracking Number: <span className="font-bold text-emerald-800 dark:text-emerald-400">{order.trackingNumber}</span> (Delhivery Logistics)
          </p>
        )}
      </div>

      {/* Items & Shipping Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Purchased Items */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3">
            Ordered Items ({order.items.length})
          </h3>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-gray-50 dark:bg-slate-800/70 rounded-2xl">
                <div className="flex items-center gap-3">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{item.product.name}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">Unit: {item.product.unit} • Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-gray-900 dark:text-white">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-slate-800 pt-3 space-y-1.5 text-xs text-gray-600 dark:text-slate-400 font-medium">
            <div className="flex justify-between"><span>Subtotal</span><span className="text-gray-900 dark:text-white font-bold">{formatCurrency(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping Fee</span><span>₹{order.shippingFee}</span></div>
            <div className="flex justify-between text-gray-500 dark:text-slate-400"><span>GST (18%)</span><span>₹{order.tax}</span></div>
            <div className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-slate-800"><span>Total</span><span className="text-emerald-800 dark:text-emerald-400">{formatCurrency(order.total)}</span></div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-xs space-y-4 h-fit">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Delivery Address
          </h3>
          <div className="text-xs text-gray-700 dark:text-slate-300 space-y-1">
            <p className="font-bold text-gray-900 dark:text-white">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="font-bold text-emerald-800 dark:text-emerald-400 pt-1">Phone: {order.shippingAddress.phone}</p>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2 text-xs">
            <span className="text-gray-400 dark:text-slate-500 block font-bold text-[10px] uppercase">Payment Status</span>
            <p className="font-bold text-gray-900 dark:text-white">{order.paymentMethod}</p>
            <div className="flex items-center justify-between">
              <span className={`inline-block font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                order.paymentStatus === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : (order.paymentStatus === 'Failed' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800')
              }`}>
                {order.paymentStatus === 'Paid' ? '✓ PAID' : (order.paymentStatus === 'Failed' ? '✕ FAILED' : '⏳ PENDING')}
              </span>
            </div>

            {order.paymentDetails && (
              <div className="bg-gray-50 dark:bg-slate-800 p-2.5 rounded-xl text-[11px] space-y-1 font-mono text-gray-700 dark:text-slate-300">
                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-sans font-bold">Transaction Record</p>
                <p><span className="font-semibold text-gray-500 dark:text-slate-400">Gateway:</span> {order.paymentDetails.gateway}</p>
                <p><span className="font-semibold text-gray-500 dark:text-slate-400">Txn ID:</span> {order.paymentDetails.transactionId}</p>
              </div>
            )}

            {order.paymentStatus !== 'Paid' && order.paymentMethod === 'Online Payment' && (
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => setShowPayModal(true)}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Complete Online Payment</span>
                </button>

                <button
                  onClick={async () => {
                    const targetId = order.numericId || order.id;
                    await orderApi.switchToCod(targetId);
                    const data = await orderApi.getOrderById(targetId);
                    setOrder(normalizeOrder(data));
                  }}
                  className="w-full py-2 px-3 bg-gray-900 dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-gray-800 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Switch to Cash on Delivery</span>
                </button>

                {/* Complaint / Support Button */}
                <a
                  href={`https://wa.me/919876543210?text=Namaste!%20Money%20debited%20from%20bank%20for%20Order%20%23${order.id}%20but%20status%20is%20pending.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Report Payment Complaint</span>
                </a>
              </div>
            )}

            {/* Cancellation Status & Actions */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
              {['CANCELLED', 'REFUNDED', 'Cancelled'].includes(order.status) ? (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-xs">
                    <XCircle className="w-4 h-4" />
                    <span>Order Cancelled</span>
                  </div>
                  <p className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">
                    Reason: <span className="font-bold">{order.cancellationReason || 'Requested by customer'}</span>
                  </p>
                  {order.refundReferenceId && (
                    <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/60 text-[11px] font-mono text-rose-900 dark:text-rose-200">
                      <p className="font-sans font-bold text-[10px] uppercase text-rose-600 dark:text-rose-400">Razorpay Refund Initiated</p>
                      <p>Refund Amount: <span className="font-bold">₹{order.refundAmount || order.total}</span></p>
                      <p>Refund Ref ID: <span className="font-bold">{order.refundReferenceId}</span></p>
                    </div>
                  )}
                </div>
              ) : ['SHIPPED', 'DELIVERED', 'Shipped', 'Delivered'].includes(order.status) ? (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-2.5 text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>This order has been shipped or delivered. Direct cancellation is disabled as per store policy.</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2 px-3 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {showPayModal && (
        <PaymentModal
          isOpen={showPayModal}
          onClose={() => setShowPayModal(false)}
          orderId={order.numericId || order.id}
          amount={order.total}
          onSuccess={async () => {
            setShowPayModal(false);
            const targetId = order.numericId || order.id;
            const data = await orderApi.getOrderById(targetId);
            setOrder(normalizeOrder(data));
          }}
        />
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                Cancel Order #{order.id}
              </h3>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <p className="text-xs text-gray-600 dark:text-slate-400">
              Please select a reason for cancelling this order. If paid online, an automated refund will be initiated to your original payment method.
            </p>

            {cancelError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Cancellation Reason</label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
                <option value="Ordered wrong product or quantity">Ordered wrong product or quantity</option>
                <option value="Delivery address or contact error">Delivery address or contact error</option>
                <option value="Delivery takes too long">Delivery takes too long</option>
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
