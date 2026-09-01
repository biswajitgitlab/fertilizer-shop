import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { adminApi } from '../../api/adminApi';
import { AdminStats, Order } from '../../types';
import { DollarSign, ShoppingBag, Package, TrendingUp, AlertCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';

import { useAuthStore } from '../../store/authStore';
export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const isDriver = (user?.role || '').toLowerCase().includes('driver') || user?.roles?.some((r: string) => r.toLowerCase().includes('driver'));
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useUIStore();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [st, ords] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getOrders({ limit: 5 })
        ]);
        setStats(st);
        setRecentOrders(ords.orders || []);
      } catch (e) {
        console.error("Admin dashboard error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading || !stats) {
    return (
      <AdminLayout title="Overview Dashboard">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-900/60 rounded-3xl border border-slate-300 dark:border-slate-800" />
            <div className="h-32 bg-slate-200 dark:bg-slate-900/60 rounded-3xl border border-slate-300 dark:border-slate-800" />
            <div className="h-32 bg-slate-200 dark:bg-slate-900/60 rounded-3xl border border-slate-300 dark:border-slate-800" />
            <div className="h-32 bg-slate-200 dark:bg-slate-900/60 rounded-3xl border border-slate-300 dark:border-slate-800" />
          </div>
          <div className="h-64 bg-slate-200 dark:bg-slate-900/60 rounded-3xl border border-slate-300 dark:border-slate-800" />
        </div>
      </AdminLayout>
    );
  }

  const revenueData = [
    { month: 'Jan', revenue: 120000 },
    { month: 'Feb', revenue: 145000 },
    { month: 'Mar', revenue: 190000 },
    { month: 'Apr', revenue: 230000 },
    { month: 'May', revenue: 310000 },
    { month: 'Jun', revenue: 450000 },
  ];

  return (
    <AdminLayout title="Store Overview Dashboard">
      <div className="space-y-8">
        
        {/* Top Stat Cards */}
        {isDriver ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard
              title="Total Delivered"
              value={stats.totalOrders}
              change="Lifetime"
              isPositive={true}
              icon={<ShoppingBag className="w-5 h-5" />}
              subtitle="Orders successfully delivered"
            />
            <StatCard
              title="Pending Deliveries"
              value={stats.activeProducts}
              change="To Do"
              isPositive={true}
              icon={<Package className="w-5 h-5 text-amber-500" />}
              subtitle="Assigned to you"
            />
            <StatCard
              title="COD Cash to Remit"
              value={formatCurrency(stats.totalRevenue)}
              change="Pending"
              isPositive={false}
              icon={<DollarSign className="w-5 h-5" />}
              subtitle="Cash collected & pending remittance"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              change="+18.4%"
              isPositive={true}
              icon={<DollarSign className="w-5 h-5" />}
              subtitle="Gross fertilizer sales"
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              change="+12.1%"
              isPositive={true}
              icon={<ShoppingBag className="w-5 h-5" />}
              subtitle="Fulfilled & Pending"
            />
            <StatCard
              title="Active SKUs"
              value={stats.activeProducts}
              icon={<Package className="w-5 h-5" />}
              subtitle="Government lab certified"
            />
            <StatCard
              title="Low Stock Warning"
              value={stats.lowStockCount}
              change="Action Needed"
              isPositive={false}
              icon={<AlertCircle className="w-5 h-5 text-rose-500" />}
              subtitle="Products < 10 bags"
            />
          </div>
        )}

        {/* Revenue Chart Section */}
        {!isDriver && (
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Monthly Revenue Growth</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">NPK, Pesticide & Seed sales analytics</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +24% vs Last Year
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
                <YAxis stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                    borderRadius: '1rem',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(val: any) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Recent Orders Table */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors">
              <span>View All Orders</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-950/40">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Farmer Name</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">#{ord.id}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{ord.shippingAddress?.name || ord.customerName || (ord as any).user?.name || 'Valued Customer'}</td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">{formatDate(ord.createdAt)}</td>
                    <td className="py-3.5 px-3 font-black text-slate-900 dark:text-white">{formatCurrency(ord.total)}</td>
                    <td className="py-3.5 px-3">
                      <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link to={`/admin/orders/${ord.id}`} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold transition-colors">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
