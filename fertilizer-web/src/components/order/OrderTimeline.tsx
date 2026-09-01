import React from 'react';
import { CheckCircle2, Clock, Truck, PackageCheck, MapPin } from 'lucide-react';

interface OrderTimelineProps {
  status: string; // Pending, Confirmed, Packed, Shipped, Delivered, Cancelled
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const steps = [
    { label: "Placed", icon: Clock },
    { label: "Confirmed", icon: CheckCircle2 },
    { label: "Packed", icon: PackageCheck },
    { label: "Shipped", icon: Truck },
    { label: "Delivered", icon: MapPin }
  ];

  const statusIndexMap: Record<string, number> = {
    'pending': 0,
    'confirmed': 1,
    'processing': 2,
    'packed': 2,
    'ready_for_pickup': 2,
    'shipped': 3,
    'out_for_delivery': 3,
    'out for delivery': 3,
    'delivered': 4,
    'cancelled': -1,
    'refunded': -1
  };

  const currentIndex = statusIndexMap[status.toLowerCase()] ?? 1;

  if (status.toLowerCase() === 'cancelled') {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold text-center">
        This order was cancelled.
      </div>
    );
  }

  return (
    <div className="py-6 px-2">
      <div className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const Icon = step.icon;
          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${isDone ? 'text-emerald-900' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1.5 -mx-4 rounded-full transition-all ${
                  idx < currentIndex ? 'bg-emerald-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
