import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { User } from '../../types';
import { Search } from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await adminApi.getCustomers();
        setCustomers(data);
      } catch (e) {
        console.error("Customers error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c =>
    (c.name || '').toLowerCase().includes((search || '').toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <AdminLayout title="Registered Farmer Network">
      <div className="space-y-6">
        
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search farmer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{filtered.length} Total Registered Farmers</span>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Farmer Name</th>
                  <th className="py-3.5 px-4">Mobile Number</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200 font-medium">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{c.name || 'Anonymous Farmer'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{c.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{(c as any).farm_location || c.state || 'Haryana'}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {c.role || 'Customer'}
                      </span>
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
