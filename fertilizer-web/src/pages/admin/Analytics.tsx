import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useUIStore } from '../../store/uiStore';
import { adminApi } from '../../api/adminApi';
import { RefreshCw } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { theme } = useUIStore();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminApi.getAnalytics();
        setAnalyticsData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const categorySales = analyticsData?.category_sales && analyticsData.category_sales.length > 0 
    ? analyticsData.category_sales 
    : [
        { name: 'No Data Yet', value: 1 }
      ];

  const topDemands = analyticsData?.top_products && analyticsData.top_products.length > 0
    ? analyticsData.top_products.map((p: any) => ({
        name: p.name,
        bags: p.total_sold
      }))
    : [
        { name: 'No Data Yet', bags: 0 }
      ];

  const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#eab308', '#ec4899'];

  return (
    <AdminLayout title="Sales & Category Analytics">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Category Share Chart */}
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Sales Breakdown by Product Category</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categorySales} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {categorySales.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                      borderRadius: '1rem',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Demands Bar Chart */}
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Top In-Demand Crop Fertilizers</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDemands}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={10} />
                <YAxis stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                    borderRadius: '1rem',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="bags" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
      )}
    </AdminLayout>
  );
};
