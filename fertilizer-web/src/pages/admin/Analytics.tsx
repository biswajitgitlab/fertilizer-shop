import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export const Analytics: React.FC = () => {
  const categorySales = [
    { name: 'Chemical Fertilizers', value: 45 },
    { name: 'Insecticides', value: 25 },
    { name: 'Organic Bio', value: 15 },
    { name: 'Herbicides', value: 10 },
    { name: 'Vitamins', value: 5 },
  ];

  const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#eab308', '#ec4899'];

  return (
    <AdminLayout title="Sales & Category Analytics">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Category Share Chart */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white">Sales Breakdown by Product Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySales} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categorySales.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Demands Bar Chart */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white">Top In-Demand Crop Fertilizers</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'NPK 19:19:19', bags: 1200 },
                { name: 'Urea 46% N', bags: 980 },
                { name: 'Vermicompost', bags: 750 },
                { name: 'Chlorpyrifos', bags: 620 },
                { name: 'Plant Growth', bags: 510 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#f8fafc' }} />
                <Bar dataKey="bags" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
