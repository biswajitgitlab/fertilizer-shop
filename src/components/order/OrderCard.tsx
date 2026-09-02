import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getStatusColor } from '../../utils/helpers';
import { Package, ArrowRight, ShoppingBag } from 'lucide-react';

// Flexible order shape — handles both snake_case (API) and camelCase (TS type)
interface FlexOrder {
  id: string | number;
  order_number?: string;
  status: string;
  total?: number;
  payment_method?: string;
  paymentMethod?: string;
  created_at?: string;
  createdAt?: string;
  items?: any[];
  items_count?: number;
  shipping_address_json?: Record<string, string>;
  shippingAddress?: { name?: string };
}

export const OrderCard: React.FC<{ order: FlexOrder }> = ({ order }) => {
  const orderId = order.id;
  const orderRef = order.order_number || `#${orderId}`;
  const status = order.status || 'Pending';
  const total = order.total ?? 0;
  const paymentMethod = order.paymentMethod || order.payment_method || 'N/A';
  const createdAt = order.createdAt || order.created_at || '';
  const items: any[] = order.items || [];
  const itemCount = items.length || order.items_count || 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all space-y-4">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Order {orderRef}</span>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">
            {createdAt ? `Placed on ${formatDate(createdAt)}` : 'Date unavailable'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-black px-3 py-1 rounded-full border ${getStatusColor(status)}`}>
            {status}
          </span>
          <span className="text-xs font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-200 dark:border-slate-700">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Items Preview */}
      <div className="flex items-center gap-3">
        {items.length > 0 ? (
          <div className="flex -space-x-2 overflow-hidden">
            {items.slice(0, 4).map((item: any, idx: number) => {
              // Handle both nested product object and flat image string
              const imgSrc =
                item?.product?.images?.[0] ||
                item?.product?.image ||
                item?.image_url ||
                item?.image ||
                null;
              const altText = item?.product?.name || item?.name || `Item ${idx + 1}`;
              return imgSrc ? (
                <img
                  key={idx}
                  src={imgSrc}
                  alt={altText}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-white dark:border-slate-900 bg-gray-50 dark:bg-slate-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  key={idx}
                  className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border-2 border-white dark:border-slate-900 flex items-center justify-center"
                >
                  <Package className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-gray-400 dark:text-slate-500" />
          </div>
        )}
        <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
          {itemCount > 0 ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'}` : 'Items unavailable'}
          {paymentMethod !== 'N/A' && ` • Payment: ${paymentMethod}`}
        </p>
      </div>

      {/* View Details Link */}
      <div className="flex justify-end pt-2">
        <Link
          to={`/orders/${orderId}`}
          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1"
        >
          <span>View Order Details &amp; Invoice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
