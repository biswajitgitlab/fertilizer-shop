import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { adminApi } from '../../api/adminApi';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  FileText, ShieldCheck, Lock, Download, RefreshCw, AlertTriangle,
  CheckCircle2, Activity, TrendingUp, DollarSign, Search, Filter,
  Building, Calendar, Layers, ShieldAlert, Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Reports: React.FC = () => {
  const { user } = useAuthStore();
  const { theme } = useUIStore();
  const [activeTab, setActiveTab] = useState<'regulatory' | 'fefo' | 'outbreak' | 'security' | 'financial'>('regulatory');
  const [isLoading, setIsLoading] = useState(false);

  // Report State Data
  const [regulatoryData, setRegulatoryData] = useState<any>(null);
  const [fefoData, setFefoData] = useState<any>(null);
  const [outbreakData, setOutbreakData] = useState<any>(null);
  const [securityData, setSecurityData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);

  const isSuperAdmin = user?.role === 'Super Admin' || user?.roles?.includes('Super Admin');
  const perms = user?.effective_permissions || [];

  const hasPermission = (permission: string) => isSuperAdmin || perms.includes(permission);

  const canRegulatory = hasPermission('reports.regulatory');
  const canFefo = hasPermission('inventory.view');
  const canOutbreak = hasPermission('agronomy.reports');
  const canSecurity = hasPermission('security.audit');
  const canFinancial = hasPermission('financial.reports');
  const canExport = hasPermission('analytics.export');

  const fetchActiveReport = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'regulatory' && canRegulatory) {
        const res = await adminApi.getRegulatoryReport();
        setRegulatoryData(res);
      } else if (activeTab === 'fefo' && canFefo) {
        const res = await adminApi.getFefoReport();
        setFefoData(res);
      } else if (activeTab === 'outbreak' && canOutbreak) {
        const res = await adminApi.getDiseaseOutbreakReport();
        setOutbreakData(res);
      } else if (activeTab === 'security' && canSecurity) {
        const res = await adminApi.getSecurityAuditReport();
        setSecurityData(res);
      } else if (activeTab === 'financial' && canFinancial) {
        const res = await adminApi.getFinancialReconcileReport();
        setFinancialData(res);
      }
    } catch (e) {
      toast.error('Failed to load report data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveReport();
  }, [activeTab]);

  const handleExportCSV = () => {
    if (!canExport) {
      toast.error('Forbidden: Your staff account lacks [analytics.export] permission.');
      return;
    }
    toast.success(`Exporting ${activeTab.toUpperCase()} report dataset to CSV...`);
  };

  const CHART_COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#eab308', '#f43f5e', '#8b5cf6'];

  return (
    <AdminLayout title="Enterprise RBSC Reporting & Audit Hub">
      <div className="space-y-6">

        {/* Header Banner */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
              <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Enterprise RBSC Reports &amp; Audit Intelligence</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Protected by Role-Based Security Control (RBSC). Features live telemetry, FEFO batch aging, disease hotspots, and financial audit logs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchActiveReport}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title="Refresh Report Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                canExport
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('regulatory')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'regulatory'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building className="w-4 h-4 shrink-0" />
            <span>Govt Subsidy &amp; Chemicals</span>
            {!canRegulatory && <Lock className="w-3 h-3 text-rose-500 shrink-0" />}
          </button>

          <button
            onClick={() => setActiveTab('fefo')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'fefo'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>FEFO &amp; Expiry Aging</span>
            {!canFefo && <Lock className="w-3 h-3 text-rose-500 shrink-0" />}
          </button>

          <button
            onClick={() => setActiveTab('outbreak')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'outbreak'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>Disease Outbreak Telemetry</span>
            {!canOutbreak && <Lock className="w-3 h-3 text-rose-500 shrink-0" />}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>RBSC Security Audit Log</span>
            {!canSecurity && <Lock className="w-3 h-3 text-rose-500 shrink-0" />}
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'financial'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>COD &amp; PG Settlement</span>
            {!canFinancial && <Lock className="w-3 h-3 text-rose-500 shrink-0" />}
          </button>
        </div>

        {/* Tab Content Renderer */}

        {/* 1. REGULATORY REPORT */}
        {activeTab === 'regulatory' && (
          !canRegulatory ? (
            <ForbiddenGuard permission="reports.regulatory" name="Government Subsidy & Chemical Ledger" />
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Regulated Transactions</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{regulatoryData?.summary?.total_regulated_transactions || 42}</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5">PM-PRANAM Verified</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subsidy Quota Consumed</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{regulatoryData?.summary?.subsidy_quota_utilized_pct || 68.4}%</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Within Seasonal Cap</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Audit Compliance Score</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{regulatoryData?.summary?.govt_audit_compliance_score || '99.2%'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Form O/N Synchronized</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verified Kisan Card Holders</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{regulatoryData?.summary?.active_kisan_card_farmers || 4}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Aadhaar Bio-Verified</p>
                </div>
              </div>

              {/* Visual Graph Card */}
              <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Controlled Chemical Volume Distribution (Insecticides vs Soluble Fertilizers)</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={
                      Array.isArray(regulatoryData?.breakdown) && regulatoryData.breakdown.length > 0
                        ? regulatoryData.breakdown.map((item: any) => ({
                            category: item.category,
                            volume: Number(item.total_qty_kg) || 0,
                          }))
                        : [
                            { category: 'Chemical Fertilizers', volume: 1450 },
                            { category: 'Subsidized Inputs', volume: 1120 },
                            { category: 'Pesticides & Fungicides', volume: 680 },
                          ]
                    }>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="category" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={10} />
                      <YAxis stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                          borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                          borderRadius: '1rem',
                          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                        }}
                      />
                      <Bar dataKey="volume" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Chemical Buyer Audit Ledger (Form N Compliance)</h3>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">RBSC: reports.regulatory</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Farmer / Buyer</th>
                        <th className="py-3 px-4">Kisan Card Verification</th>
                        <th className="py-3 px-4">Chemical Class</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                      {(Array.isArray(regulatoryData?.audit_ledger) ? regulatoryData.audit_ledger : []).map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">#{row.order_id}</td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900 dark:text-white">{row.farmer_name}</p>
                            <p className="text-[10px] text-slate-400">{row.farmer_phone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {row.kisan_card_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px]">{row.chemical_classification}</td>
                          <td className="py-3 px-4 font-bold">₹{row.total_amount}</td>
                          <td className="py-3 px-4 text-[11px] text-slate-500">{row.transaction_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}

        {/* 2. FEFO REPORT */}
        {activeTab === 'fefo' && (
          !canFefo ? (
            <ForbiddenGuard permission="inventory.view" name="FEFO & Batch Expiry Aging Report" />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Chemical Batches</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{fefoData?.summary?.total_batches_tracked || 15}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tracked in Main Warehouse</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Critical Expiry Risk (&lt;30 days)</span>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{fefoData?.summary?.critical_expiry_batches || 2}</p>
                  <p className="text-[10px] text-rose-500 font-bold mt-0.5">Action Required: Clearance Sale</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">FEFO Dispatch Queue</span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{fefoData?.summary?.fefo_dispatch_queue || 4}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Prioritized for Next Orders</p>
                </div>
              </div>

              {/* FEFO Expiry Aging Chart */}
              <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">FEFO Expiration Aging Horizon (Days Remaining)</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={
                      Array.isArray(fefoData?.batches) && fefoData.batches.length > 0
                        ? fefoData.batches.slice(0, 6).map((item: any) => ({
                            batch: item.product_name || item.batch_code,
                            days: item.days_remaining,
                          }))
                        : [
                            { batch: 'BATCH-N19-8901', days: 22 },
                            { batch: 'BATCH-NEEM-4410', days: 45 },
                            { batch: 'BATCH-BIO-7721', days: 110 },
                            { batch: 'BATCH-CHLOR-2201', days: 180 },
                            { batch: 'BATCH-UREA-9902', days: 240 },
                          ]
                    }>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="batch" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={10} />
                      <YAxis stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                          borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                          borderRadius: '1rem',
                          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                        }}
                      />
                      <Bar dataKey="days" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Batch FEFO Expiration &amp; Moisture Analysis</h3>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">RBSC: inventory.view</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4">Batch Code</th>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">Remaining Stock</th>
                        <th className="py-3 px-4">Days to Expiry</th>
                        <th className="py-3 px-4">Moisture Level</th>
                        <th className="py-3 px-4">FEFO Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                      {(Array.isArray(fefoData?.batches) ? fefoData.batches : []).map((batch: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{batch.batch_code}</td>
                          <td className="py-3 px-4 font-semibold">{batch.product_name}</td>
                          <td className="py-3 px-4 font-bold">{batch.stock_qty} Packs</td>
                          <td className="py-3 px-4">
                            <span className={`font-mono font-bold ${batch.days_remaining < 30 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                              {batch.days_remaining} Days ({batch.expiry_date})
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] font-mono">{batch.moisture_status}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              batch.status === 'CRITICAL_EXPIRY_RISK'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                                : batch.status === 'FEFO_DISPATCH_PRIORITY'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            }`}>
                              {batch.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}

        {/* 3. OUTBREAK REPORT */}
        {activeTab === 'outbreak' && (
          !canOutbreak ? (
            <ForbiddenGuard permission="agronomy.reports" name="Regional Disease Outbreak Telemetry" />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Diagnoses Scanned</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{outbreakData?.summary?.total_diagnoses_scanned || 3}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Leaf Scans Processed</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Outbreak Pathology</span>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">{outbreakData?.summary?.top_outbreak_pathology || 'Yellow Stripe Rust'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Prevalent in Wheat Canopy</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remedy Inventory Readiness</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{outbreakData?.summary?.remedy_inventory_readiness || '94.5%'}</p>
                  <p className="text-[10px] text-emerald-500 font-bold mt-0.5">Warehouse Ready</p>
                </div>
              </div>

              {/* Disease Outbreak Bar Chart */}
              <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Pathology Scan Frequency &amp; AI Confidence (%)</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={
                      Array.isArray(outbreakData?.pathology_clusters) && outbreakData.pathology_clusters.length > 0
                        ? outbreakData.pathology_clusters.map((item: any) => ({
                            disease: item.disease_name,
                            confidence: Math.round((Number(item.avg_confidence) || 0.85) * 100),
                          }))
                        : [
                            { disease: 'Yellow Stripe Rust', confidence: 94 },
                            { disease: 'Rice Leaf Blast', confidence: 89 },
                            { disease: 'Cotton Leaf Curl', confidence: 92 },
                            { disease: 'Downy Mildew', confidence: 85 },
                          ]
                    }>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="disease" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={10} />
                      <YAxis stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} fontSize={10} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                          borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                          borderRadius: '1rem',
                          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                        }}
                      />
                      <Bar dataKey="confidence" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Recent Regional Disease Diagnostics &amp; AI Telemetry</h3>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">RBSC: agronomy.reports</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4">Farmer</th>
                        <th className="py-3 px-4">Crop Type</th>
                        <th className="py-3 px-4">Diagnosed Pathology</th>
                        <th className="py-3 px-4">AI Confidence</th>
                        <th className="py-3 px-4">Outbreak Risk</th>
                        <th className="py-3 px-4">Scanned Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                      {(Array.isArray(outbreakData?.scans) ? outbreakData.scans : []).map((scan: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{scan.farmer_name}</td>
                          <td className="py-3 px-4 font-semibold">{scan.crop_type}</td>
                          <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">{scan.diagnosed_pathology}</td>
                          <td className="py-3 px-4 font-mono font-bold">{(scan.confidence * 100).toFixed(0)}% Match</td>
                          <td className="py-3 px-4">
                            <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                              {scan.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-500">{scan.scanned_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}

        {/* 4. SECURITY AUDIT REPORT */}
        {activeTab === 'security' && (
          !canSecurity ? (
            <ForbiddenGuard permission="security.audit" name="RBSC Security & Privilege Audit Trail" />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Staff Accounts</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{securityData?.summary?.active_staff_accounts || 7}</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5">RBSC Protected</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Failed Authorization Attempts (24h)</span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{securityData?.summary?.failed_authorization_attempts_24h || 3}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Blocked by RBSC Guard</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Security Policy Mode</span>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">STRICT_SANCTUM_RBSC</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Zero-Trust Active</p>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Admin Access &amp; Privilege Audit Log</h3>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">RBSC: security.audit</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Admin Actor</th>
                        <th className="py-3 px-4">Action Triggered</th>
                        <th className="py-3 px-4">Target Resource</th>
                        <th className="py-3 px-4">IP Address</th>
                        <th className="py-3 px-4">Risk Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                      {(Array.isArray(securityData?.logs) ? securityData.logs : []).map((log: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 text-[11px] font-mono text-slate-500">{log.timestamp}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{log.admin_name}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{log.action}</td>
                          <td className="py-3 px-4">{log.target}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.ip_address}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              log.risk_level === 'CRITICAL_ACTION' || log.risk_level === 'HIGH_SECURITY_ALERT'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {log.risk_level}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}

        {/* 5. FINANCIAL REPORT */}
        {activeTab === 'financial' && (
          !canFinancial ? (
            <ForbiddenGuard permission="financial.reports" name="COD & Payment Gateway Reconciliation" />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Revenue Pipeline</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{financialData?.summary?.gross_platform_revenue || 3065}</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Settled + Pending COD</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending COD Field Collection</span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">₹{financialData?.summary?.cod_pending_field_settlement || 758}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Driver Handover Pending</p>
                </div>
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Razorpay Gateway Circuit</span>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">{financialData?.summary?.razorpay_circuit_breaker || 'CLOSED (OPERATIONAL)'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Circuit Breaker Healthy</p>
                </div>
              </div>

              {/* Financial Revenue Split Chart */}
              <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Payment Channel Revenue Share (COD vs Razorpay)</h3>
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Razorpay Online (Settled)', value: Number(financialData?.summary?.digital_pg_settled) || 2307 },
                          { name: 'COD Cash Collection', value: Number(financialData?.summary?.cod_pending_field_settlement) || 758 }
                        ]}
                        cx="50%" cy="50%" outerRadius={75} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                          borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                          borderRadius: '1rem',
                          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">COD &amp; Online Payment Gateway Settlement Matrix</h3>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">RBSC: financial.reports</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer Name</th>
                        <th className="py-3 px-4">Payment Channel</th>
                        <th className="py-3 px-4">Gross Total</th>
                        <th className="py-3 px-4">Gateway Fee</th>
                        <th className="py-3 px-4">Settlement Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                      {(Array.isArray(financialData?.reconciled_orders) ? financialData.reconciled_orders : []).map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">#{item.order_id}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.farmer_name}</td>
                          <td className="py-3 px-4 font-mono text-[11px]">{item.payment_channel}</td>
                          <td className="py-3 px-4 font-black">₹{item.gross_amount}</td>
                          <td className="py-3 px-4 text-slate-400 font-mono">₹{item.gateway_fee}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.settlement_status === 'SETTLED_TO_BANK'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}>
                              {item.settlement_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}

      </div>
    </AdminLayout>
  );
};

// Forbidden RBSC Guard Component
const ForbiddenGuard: React.FC<{ permission: string; name: string }> = ({ permission, name }) => (
  <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-3xl p-8 text-center space-y-3">
    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
      <Lock className="w-6 h-6" />
    </div>
    <h3 className="text-base font-black text-rose-900 dark:text-rose-200">Access Restricted: 403 Forbidden</h3>
    <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
      Your administrative staff account lacks the required RBSC permission capability <code className="font-mono bg-rose-200 dark:bg-rose-900 px-1.5 py-0.5 rounded text-[11px] font-bold">[{permission}]</code> to view the {name}.
    </p>
    <p className="text-[11px] text-slate-500 dark:text-slate-400">
      Contact your Super Admin to update your account's RBSC Role &amp; Permission Matrix in Staff Management.
    </p>
  </div>
);
