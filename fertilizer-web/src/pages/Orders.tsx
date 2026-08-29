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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Farm Orders</h1>
          <p className="text-xs text-gray-500">Track shipments and view tax invoices</p>
        </div>
      </div>

      {/* States */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-gray-200 rounded-3xl" />
          <div className="h-28 bg-gray-200 rounded-3xl" />
          <div className="h-28 bg-gray-200 rounded-3xl" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center space-y-2">
          <p className="text-sm font-bold text-rose-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-rose-600 hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">No orders placed yet</h3>
            <p className="text-xs text-gray-500 mt-1">
              Explore our certified products and place your first fertilizer order.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
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
