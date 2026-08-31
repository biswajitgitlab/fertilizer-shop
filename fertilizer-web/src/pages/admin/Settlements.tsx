import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { apiClient as api } from '../../api/axiosInstances';
import { Landmark, CheckCircle, Clock, RefreshCw, DollarSign } from 'lucide-react';

const Settlements: React.FC = () => {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settlements');
      setSettlements(res.data || []);
    } catch (err) {
      console.error('Failed to fetch settlements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleSettle = async (id: number) => {
    try {
      await api.post(`/admin/settlements/${id}/settle`);
      fetchSettlements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Settlement execution failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Landmark className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              COD Field Driver Settlement Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Field delivery driver cash collection reconciliation &amp; bank settlement ledger
            </p>
          </div>
          <button
            onClick={fetchSettlements}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Settlements
          </button>
        </div>

        {/* Table */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Farmer / Customer</th>
                  <th className="py-3 px-4">Assigned Delivery Driver</th>
                  <th className="py-3 px-4">Cash Amount Collected</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Settlement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">Loading settlement ledger...</td>
                  </tr>
                ) : settlements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">No driver cash settlements found.</td>
                  </tr>
                ) : (
                  settlements.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">#{s.order_id}</td>
                      <td className="py-3 px-4 font-semibold">{s.order?.user?.name || 'Customer'}</td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{s.driver?.name || 'Field Officer Vikram'}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{Number(s.cash_collected || s.order?.total || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          s.status === 'SETTLED_TO_BANK'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {s.status === 'SETTLED_TO_BANK' ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Bank Settled
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSettle(s.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition"
                          >
                            Reconcile to Bank
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settlements;
