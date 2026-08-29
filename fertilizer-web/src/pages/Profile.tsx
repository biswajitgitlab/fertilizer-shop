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
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
          {user?.name?.[0] || 'F'}
        </div>

        <div className="text-center sm:text-left space-y-1 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-gray-900">{user?.name}</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              {user?.role === 'admin' ? 'Merchant Admin' : 'Verified Farmer'}
            </span>
          </div>
          <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>+91 {user?.phone}</span>
          </p>
          <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{user?.farmLocation || 'Haryana, India'}</span>
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={logout} icon={<LogOut className="w-4 h-4" />}>
          Sign Out
        </Button>
      </div>

      {/* Quick Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/orders" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">My Fertilizer Orders</h3>
            <p className="text-xs text-gray-400">View order status & tax invoices</p>
          </div>
        </Link>

        <Link to="/planner" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Crop Schedules</h3>
            <p className="text-xs text-gray-400">NPK spray dates & task reminders</p>
          </div>
        </Link>
      </div>

    </div>
  );
};
