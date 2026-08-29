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

  const COLORS = ['#059669', '#0d9488', '#16a34a', '#ca8a04', '#0284c7'];

  return (
    <AdminLayout title="Sales & Category Analytics">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Category Share Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-base font-black text-gray-900">Sales Breakdown by Product Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySales} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Demands Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-base font-black text-gray-900">Top In-Demand Crop Fertilizers</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'NPK 19:19:19', bags: 1200 },
                { name: 'Urea 46% N', bags: 980 },
                { name: 'Vermicompost', bags: 750 },
                { name: 'Chlorpyrifos', bags: 620 },
                { name: 'Plant Growth', bags: 510 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Bar dataKey="bags" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
