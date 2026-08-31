import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceDownloader } from '../../components/order/InvoiceDownloader';
import { ArrowLeft, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingNo, setTrackingNo] = useState('');
  const [selectedPacker, setSelectedPacker] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderAndStaff = async () => {
      try {
        if (!id) return;
        const [data, team] = await Promise.all([
          adminApi.getOrderById(id),
          adminApi.getTeam().catch(() => [])
        ]);
        setOrder(data);
        if (data.trackingNumber) setTrackingNo(data.trackingNumber);
        if (data.packerId) setSelectedPacker(String(data.packerId));
        if (data.driverId) setSelectedDriver(String(data.driverId));
        setStaffList(Array.isArray(team) ? team : []);
      } catch (e) {
        console.error("Admin order detail error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderAndStaff();
  }, [id]);

  const handleSaveTracking = async () => {
    if (!order) return;
    try {
      await adminApi.updateOrderStatus(order.id, order.status, trackingNo, selectedPacker, selectedDriver);
      toast.success("Order fulfillment and staff assignments saved!");
      const updated = await adminApi.getOrderById(order.id);
      setOrder(updated);
    } catch (e) {
      toast.error("Failed to update order details.");
    }
  };

  const handlePackerSelect = async (packerId: string) => {
    setSelectedPacker(packerId);
    if (!order) return;
    try {
      const targetStatus = (order.status === 'Pending' || order.status === 'Confirmed') ? 'Packed' : order.status;
      await adminApi.updateOrderStatus(order.id, targetStatus, trackingNo, packerId, selectedDriver);
      toast.success(`Warehouse Packer assigned! Order auto-updated to ${targetStatus}.`);
      const updated = await adminApi.getOrderById(order.id);
      setOrder(updated);
    } catch (e) {
      toast.error("Failed to assign packer.");
    }
  };

  const handleDriverSelect = async (driverId: string) => {
    setSelectedDriver(driverId);
    if (!order) return;
    try {
      const targetStatus = (['Pending', 'Confirmed', 'Packed', 'Processing'].includes(order.status)) ? 'Shipped' : order.status;
      await adminApi.updateOrderStatus(order.id, targetStatus, trackingNo, selectedPacker, driverId);
      toast.success(`Logistics Driver assigned! Order auto-updated to ${targetStatus}.`);
      const updated = await adminApi.getOrderById(order.id);
      setOrder(updated);
    } catch (e) {
      toast.error("Failed to assign driver.");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      await adminApi.updateOrderStatus(order.id, newStatus, trackingNo, selectedPacker, selectedDriver);
      toast.success(`Order status updated to ${newStatus}${newStatus === 'Delivered' ? ' & Payment Collected' : ''}!`);
      const updated = await adminApi.getOrderById(order.id);
      setOrder(updated);
    } catch (e) {
      toast.error("Failed to update order status.");
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
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-wider">
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
                        {it.product.category?.includes('Organic') ? 'ZONE-B' : it.product.category?.includes('Insect') ? 'ZONE-C' : it.product.category?.includes('Micro') ? 'ZONE-D' : 'ZONE-A'}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                      FEFO Priority Dispatch: <strong className="text-slate-700 dark:text-slate-200">Earliest Lot Batch</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              {/* Sequential Operational Workflow Progress Bar */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">⚡ Fulfillment Workflow Actions</h4>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Current: {order.status}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleStatusChange('Packed')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      ['Packed', 'Processing'].includes(order.status)
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                    }`}
                  >
                    1. Warehouse Packed
                  </button>
                  <button
                    onClick={() => handleStatusChange('Shipped')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      order.status === 'Shipped'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                    }`}
                  >
                    2. Shipped / In Transit
                  </button>
                  <button
                    onClick={() => handleStatusChange('Out for Delivery')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      order.status === 'Out for Delivery'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                    }`}
                  >
                    3. Out for Delivery
                  </button>
                  <button
                    onClick={() => handleStatusChange('Delivered')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    4. Delivered & Paid
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>📦 Warehouse Packer</span>
                  </label>
                  <select
                    value={selectedPacker}
                    onChange={(e) => handlePackerSelect(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="">Unassigned</option>
                    <optgroup label="✓ Operational Warehouse Packers">
                      {staffList.filter(s => (s.role || '').toLowerCase().includes('packer') || (s.role || '').toLowerCase().includes('warehouse')).map(s => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name} — ({s.role})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Admin / Management Staff">
                      {staffList.filter(s => !(s.role || '').toLowerCase().includes('packer') && !(s.role || '').toLowerCase().includes('warehouse')).map(s => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name} ({s.role || 'Staff'})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>🚚 Logistics Driver</span>
                  </label>
                  <select
                    value={selectedDriver}
                    onChange={(e) => handleDriverSelect(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="">Unassigned</option>
                    <optgroup label="✓ Operational Logistics Drivers">
                      {staffList.filter(s => (s.role || '').toLowerCase().includes('driver') || (s.role || '').toLowerCase().includes('logistics') || (s.role || '').toLowerCase().includes('field')).map(s => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name} — ({s.role})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Operations / Staff">
                      {staffList.filter(s => !(s.role || '').toLowerCase().includes('driver') && !(s.role || '').toLowerCase().includes('logistics') && !(s.role || '').toLowerCase().includes('field')).map(s => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name} ({s.role || 'Staff'})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Assign Courier Tracking Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. DELHIVERY-890214"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button onClick={handleSaveTracking} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer">
                    Save Order Fulfillment
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-4 h-fit text-xs text-slate-700 dark:text-slate-300">
            <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Shipping Info
            </h3>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{order.customerName || order.shippingAddress?.name || 'Valued Customer'}</p>
            <p className="text-slate-500 dark:text-slate-400">{order.shippingAddress?.line1 || 'N/A'}</p>
            <p className="text-slate-500 dark:text-slate-400">{[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ')}{order.shippingAddress?.pincode ? ` - ${order.shippingAddress.pincode}` : ''}</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 pt-1">Ph: {order.shippingAddress?.phone || order.phone || 'N/A'}</p>

            {/* Assigned Staff Summary Box */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider">Assigned Operations Staff</h4>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Packer:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{order.packerName || 'Not Assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{order.driverName || 'Not Assigned'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
