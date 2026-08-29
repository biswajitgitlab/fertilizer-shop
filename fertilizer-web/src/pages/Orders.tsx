import React, { useState, useEffect } from 'react';
import { orderApi } from '../api/orderApi';
import { OrderCard } from '../components/order/OrderCard';
import { Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.getMyOrders();
        // Handle both array and paginated object ({ data: [...], total, ... })
        let list: any[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.data)) {
          list = data.data;
        }
        setOrders(list);
        if (list.length > 0) {
          localStorage.setItem('krishi_has_placed_orders', 'true');
        }
      } catch (e) {
        console.error("Orders error:", e);
        setError("Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Card */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 rounded-3xl border border-emerald-200/80 dark:border-slate-800/80 shadow-lg shadow-emerald-900/5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30 shrink-0">
          <Package className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">My Farm Orders</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Track fertilizer shipments, delivery status, and view tax invoices</p>
        </div>
      </div>

      {/* States */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-white/70 dark:bg-slate-800/60 rounded-3xl border border-emerald-100/60 dark:border-slate-800" />
          <div className="h-28 bg-white/70 dark:bg-slate-800/60 rounded-3xl border border-emerald-100/60 dark:border-slate-800" />
        </div>
      ) : error ? (
        <div className="bg-rose-50/90 dark:bg-rose-950/40 backdrop-blur-md border border-rose-200 dark:border-rose-800 rounded-3xl p-8 text-center space-y-2">
          <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-bold"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-emerald-200/80 dark:border-slate-800 p-12 text-center space-y-4 shadow-lg shadow-emerald-900/5">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No orders placed yet</h3>
            <p className="text-xs text-gray-600 dark:text-slate-400 max-w-md mx-auto">
              Explore our government-certified products and place your first fertilizer order.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-md shadow-emerald-600/20 transition-all"
          >
            <span>Shop Fertilizers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <OrderCard key={ord.id} order={ord} />
          ))}
        </div>
      )}
    </div>

  );
};
