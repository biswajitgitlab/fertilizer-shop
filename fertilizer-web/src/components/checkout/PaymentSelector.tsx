import React from 'react';
import { CreditCard, Banknote, ShieldCheck } from 'lucide-react';

interface PaymentSelectorProps {
  paymentMethod: 'Cash on Delivery' | 'Online Payment';
  onChangeMethod: (method: 'Cash on Delivery' | 'Online Payment') => void;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  paymentMethod,
  onChangeMethod
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3">
        Select Payment Method
      </h3>

      <div className="space-y-3">
        {/* Cash on delivery */}
        <label
          onClick={() => onChangeMethod('Cash on Delivery')}
          className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            paymentMethod === 'Cash on Delivery'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 font-bold'
              : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">Cash on Delivery (Pay at Farm)</h4>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">Pay cash directly to courier on delivery</p>
            </div>
          </div>
          <input
            type="radio"
            name="payment"
            checked={paymentMethod === 'Cash on Delivery'}
            onChange={() => onChangeMethod('Cash on Delivery')}
            className="accent-emerald-600 shrink-0"
          />
        </label>

        {/* Online Payment */}
        <label
          onClick={() => onChangeMethod('Online Payment')}
          className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            paymentMethod === 'Online Payment'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 font-bold'
              : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">Online Payment (UPI, Cards, NetBanking)</h4>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">Instant confirmation via Razorpay gateway</p>
            </div>
          </div>
          <input
            type="radio"
            name="payment"
            checked={paymentMethod === 'Online Payment'}
            onChange={() => onChangeMethod('Online Payment')}
            className="accent-emerald-600 shrink-0"
          />
        </label>
      </div>
    </div>
  );
};
