import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { adminApi } from '../../api/adminApi';
import { AdminStats, Order } from '../../types';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [st, ords] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getOrders({ limit: 5 })
        ]);
        setStats(st);
        setRecentOrders(ords.orders);
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
            <div className="h-28 bg-gray-200 rounded-2xl" />
            <div className="h-28 bg-gray-200 rounded-2xl" />
            <div className="h-28 bg-gray-200 rounded-2xl" />
            <div className="h-28 bg-gray-200 rounded-2xl" />
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl" />
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
        
        {/* Top 4 Stat Cards */}
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
            icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
            subtitle="Products < 10 bags"
          />
        </div>

        {/* Revenue Chart Section */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-gray-900">Monthly Revenue Growth</h3>
              <p className="text-xs text-gray-500">NPK, Pesticide & Seed sales analytics</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +24% vs Last Year
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip formatter={(val: any) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-gray-900">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
              <span>View All Orders</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 px-2">Order ID</th>
                  <th className="pb-3 px-2">Farmer Name</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-800 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-2 font-bold text-gray-900">#{ord.id}</td>
                    <td className="py-3 px-2 font-semibold">{ord.shippingAddress.name}</td>
                    <td className="py-3 px-2 text-gray-500">{formatDate(ord.createdAt)}</td>
                    <td className="py-3 px-2 font-black text-gray-900">{formatCurrency(ord.total)}</td>
                    <td className="py-3 px-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link to={`/admin/orders/${ord.id}`} className="text-emerald-600 hover:underline font-bold">
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
