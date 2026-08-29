import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { User, Phone, MapPin, ShieldCheck, LogOut, Package, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Card Header */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-emerald-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-lg shadow-emerald-900/5 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-3xl flex items-center justify-center shadow-md shadow-emerald-600/30 shrink-0">
          {user?.name?.[0] || 'F'}
        </div>

        <div className="text-center sm:text-left space-y-1.5 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{user?.name}</h1>
            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase">
              {user?.role === 'admin' ? 'Merchant Admin' : 'Verified Farmer'}
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1">
            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>+91 {user?.phone}</span>
          </p>
          <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{user?.farmLocation || 'Haryana, India'}</span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          icon={<LogOut className="w-4 h-4" />}
          className="rounded-xl border-emerald-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-800 font-bold"
        >
          Sign Out
        </Button>
      </div>

      {/* Quick Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/orders"
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-emerald-200/70 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-600/10 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              My Fertilizer Orders
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">View shipment status & tax invoices</p>
          </div>
        </Link>

        <Link
          to="/planner"
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-emerald-200/70 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-600/10 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              Crop Schedules
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">NPK spray dates & task reminders</p>
          </div>
        </Link>
      </div>
    </div>

  );
};
