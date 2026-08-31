import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { apiClient as api } from '../../api/axiosInstances';
import { UserCheck, ShieldCheck, CreditCard, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const Farmers: React.FC = () => {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/farmers');
      setFarmers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch farmers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleVerify = async (id: number, status: string) => {
    try {
      await api.post(`/admin/farmers/${id}/verify`, {
        verification_status: status,
        kcc_number: `KCC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        subsidy_tier: 'PM-PRANAM Direct Subsidy Category A'
      });
      fetchFarmers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification update failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              Farmer KCC Subsidy Verification Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verify Aadhaar biometric hashes &amp; Kisan Credit Card (KCC) credentials for government direct subsidies
            </p>
          </div>
          <button
            onClick={fetchFarmers}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Roster
          </button>
        </div>

        {/* Table */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Farmer Name</th>
                  <th className="py-3 px-4">Email / Phone</th>
                  <th className="py-3 px-4">KCC Card Number</th>
                  <th className="py-3 px-4">PM-PRANAM Subsidy Tier</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">Loading farmer accounts...</td>
                  </tr>
                ) : farmers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">No farmer records found.</td>
                  </tr>
                ) : (
                  farmers.map((farmer: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{farmer.name}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{farmer.email || farmer.phone}</td>
                      <td className="py-3 px-4 font-mono text-[11px] font-bold">{farmer.kcc_number || 'KCC-PENDING-REG'}</td>
                      <td className="py-3 px-4 text-[11px]">{farmer.subsidy_tier || 'PM-PRANAM Category A'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          farmer.verification_status === 'VERIFIED_AADHAAR'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                        }`}>
                          {farmer.verification_status || 'PENDING_DOCUMENTATION'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {farmer.verification_status === 'VERIFIED_AADHAAR' ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerify(farmer.id, 'VERIFIED_AADHAAR')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition"
                          >
                            Approve Subsidy
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

export default Farmers;
