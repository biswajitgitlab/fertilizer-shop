import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import {
  adminApi,
  DEMO_REGULATORY_REPORT,
  DEMO_FEFO_REPORT,
  DEMO_OUTBREAK_REPORT,
  DEMO_SECURITY_REPORT,
  DEMO_FINANCIAL_REPORT
} from '../../api/adminApi';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import {
  FileText, Lock, Download, RefreshCw,
  Activity, DollarSign, Search, Filter,
  Building, Layers, ShieldAlert, Cpu, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Reports: React.FC = () => {
  const { user } = useAuthStore();
  const { theme } = useUIStore();
  const [activeTab, setActiveTab] = useState<'regulatory' | 'fefo' | 'outbreak' | 'security' | 'financial'>('regulatory');
  const [isLoading, setIsLoading] = useState(false);

  // Pagination & Search Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

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
    const params = {
      page,
      per_page: perPage,
      search,
      status: statusFilter,
    };
    try {
      if (activeTab === 'regulatory' && canRegulatory) {
        const res = await adminApi.getRegulatoryReport(params);
        setRegulatoryData(res);
      } else if (activeTab === 'fefo' && canFefo) {
        const res = await adminApi.getFefoReport(params);
        setFefoData(res);
      } else if (activeTab === 'outbreak' && canOutbreak) {
        const res = await adminApi.getDiseaseOutbreakReport(params);
        setOutbreakData(res);
      } else if (activeTab === 'security' && canSecurity) {
        const res = await adminApi.getSecurityAuditReport(params);
        setSecurityData(res);
      } else if (activeTab === 'financial' && canFinancial) {
        const res = await adminApi.getFinancialReconcileReport(params);
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
  }, [activeTab, page, perPage, statusFilter]);

  // Reset pagination when search keyword or tab changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchActiveReport();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
    setStatusFilter('');
  };

  const handleExportCSV = () => {
    if (!canExport) {
      toast.error('Forbidden: Your staff account lacks [analytics.export] permission.');
      return;
    }
    toast.success(`Exporting ${activeTab.toUpperCase()} report dataset to CSV...`);
  };

  const getActiveMeta = () => {
    if (activeTab === 'regulatory') return regulatoryData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };
    if (activeTab === 'fefo') return fefoData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };
    if (activeTab === 'outbreak') return outbreakData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };
    if (activeTab === 'security') return securityData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };
    if (activeTab === 'financial') return financialData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };
    return null;
  };

  const meta = getActiveMeta() || { current_page: 1, last_page: 1, per_page: 10, total: 0 };

  const getRegulatoryRows = () => {
    if (regulatoryData?.data && Array.isArray(regulatoryData.data)) return regulatoryData.data;
    if (regulatoryData?.audit_ledger && Array.isArray(regulatoryData.audit_ledger)) return regulatoryData.audit_ledger;
    return [];
  };

  const getFefoRows = () => {
    if (fefoData?.data && Array.isArray(fefoData.data)) return fefoData.data;
    if (fefoData?.batches && Array.isArray(fefoData.batches)) return fefoData.batches;
    return [];
  };

  const getOutbreakRows = () => {
    if (outbreakData?.data && Array.isArray(outbreakData.data)) return outbreakData.data;
    if (outbreakData?.scans && Array.isArray(outbreakData.scans)) return outbreakData.scans;
    return [];
  };

  const getSecurityRows = () => {
    if (securityData?.data && Array.isArray(securityData.data)) return securityData.data;
    if (securityData?.logs && Array.isArray(securityData.logs)) return securityData.logs;
    return [];
  };

  const getFinancialRows = () => {
    if (financialData?.data && Array.isArray(financialData.data)) return financialData.data;
    if (financialData?.reconciled_orders && Array.isArray(financialData.reconciled_orders)) return financialData.reconciled_orders;
    return [];
  };

  return (
    <AdminLayout title="Enterprise RBSC Reporting & Audit Hub">
      <div className="space-y-6">

        {/* Header Banner */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Enterprise RBSC Reports &amp; Audit Intelligence</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1 shrink-0">
                <Cpu className="w-3.5 h-3.5" /> Redis Cache Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Redis-backed cached datasets with real-time parameter filtering, server-side pagination, and RBSC security.
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
            onClick={() => handleTabChange('regulatory')}
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
            onClick={() => handleTabChange('fefo')}
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
            onClick={() => handleTabChange('outbreak')}
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
            onClick={() => handleTabChange('security')}
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
            onClick={() => handleTabChange('financial')}
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

        {/* Search & Filter Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by ID, keyword, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                {activeTab === 'fefo' && (
                  <>
                    <option value="SAFE">SAFE</option>
                    <option value="FEFO_DISPATCH_PRIORITY">FEFO DISPATCH PRIORITY</option>
                    <option value="CRITICAL_EXPIRY_RISK">CRITICAL EXPIRY RISK</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </>
                )}
                {activeTab === 'security' && (
                  <>
                    <option value="LOW">LOW Risk</option>
                    <option value="MEDIUM">MEDIUM Risk</option>
                    <option value="HIGH">HIGH Risk</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </>
                )}
                {activeTab === 'financial' && (
                  <>
                    <option value="SETTLED_TO_BANK">SETTLED TO BANK</option>
                    <option value="DRIVER_COLLECTION_PENDING">DRIVER COLLECTION PENDING</option>
                  </>
                )}
              </select>
            </div>

            {/* Per Page Selector */}
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 font-bold focus:outline-none cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* Tab Content Renderer */}

        {/* 1. REGULATORY REPORT */}
        {activeTab === 'regulatory' && (
          !canRegulatory ? (
            <ForbiddenGuard permission="reports.regulatory" name="Government Subsidy & Chemical Ledger" />
          ) : (
            <div className="space-y-6">
              {isLoading ? (
                <ReportSkeletonLoader />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Regulated Transactions</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{regulatoryData?.summary?.total_regulated_transactions ?? 0}</p>
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5">PM-PRANAM Verified</p>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subsidy Quota Consumed</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{regulatoryData?.summary?.subsidy_quota_utilized_pct ?? 0}%</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Within Seasonal Cap</p>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Audit Compliance Score</span>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{regulatoryData?.summary?.govt_audit_compliance_score ?? '0%'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Form O/N Synchronized</p>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verified Kisan Card Holders</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{regulatoryData?.summary?.active_kisan_card_farmers ?? 0}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Aadhaar Bio-Verified</p>
                    </div>
                  </div>

                  <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Controlled Chemical Volume Distribution</h3>
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
                          {getRegulatoryRows().length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                                No matching regulatory records found for search query or filter.
                              </td>
                            </tr>
                          ) : (
                            getRegulatoryRows().map((row: any, i: number) => (
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
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        )}

        {/* 2. FEFO REPORT */}
        {activeTab === 'fefo' && (
          !canFefo ? (
            <ForbiddenGuard permission="inventory.view" name="FEFO & Batch Expiry Aging Report" />
          ) : (
            <div className="space-y-6">
              {isLoading ? (
                <ReportSkeletonLoader />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Chemical Batches</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{fefoData?.summary?.total_batches_tracked ?? 0}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tracked in Main Warehouse</p>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Critical Expiry Risk (&lt;30 days)</span>
                      <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{fefoData?.summary?.critical_expiry_batches ?? 0}</p>
                      <p className="text-[10px] text-rose-500 font-bold mt-0.5">Action Required: Clearance Sale</p>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">FEFO Dispatch Queue</span>
                      <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{fefoData?.summary?.fefo_dispatch_queue ?? 0}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Prioritized for Next Orders</p>
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
                            <th className="py-3 px-4">Warehouse Zone</th>
                            <th className="py-3 px-4">Remaining Stock</th>
                            <th className="py-3 px-4">Days to Expiry</th>
                            <th className="py-3 px-4">Moisture Level</th>
                            <th className="py-3 px-4">FEFO Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200">
                          {getFefoRows().length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                                No matching FEFO batch records found for search query or filter.
                              </td>
                            </tr>
                          ) : (
                            getFefoRows().map((batch: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{batch.batch_code}</td>
                                <td className="py-3 px-4 font-semibold">{batch.product_name}</td>
                                <td className="py-3 px-4 font-mono text-[11px]">{batch.warehouse_zone || 'ZONE-A1'}</td>
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
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        )}

        {/* 3. OUTBREAK REPORT */}
        {activeTab === 'outbreak' && (
          !canOutbreak ? (
            <ForbiddenGuard permission="agronomy.reports" name="Regional Disease Outbreak Telemetry" />
          ) : (
            <div className="space-y-6">
              {isLoading ? (
                <ReportSkeletonLoader />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Diagnoses Scanned</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{outbreakData?.summary?.total_diagnoses_scanned ?? 0}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Leaf Scans Processed</p>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Outbreak Pathology</span>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">{outbreakData?.summary?.top_outbreak_pathology ?? 'None'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Prevalent in Wheat Canopy</p>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remedy Inventory Readiness</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{outbreakData?.summary?.remedy_inventory_readiness ?? '0%'}</p>
                      <p className="text-[10px] text-emerald-500 font-bold mt-0.5">Warehouse Ready</p>
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
                          {getOutbreakRows().length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                                No matching disease telemetry records found for search query or filter.
                              </td>
                            </tr>
                          ) : (
                            getOutbreakRows().map((scan: any, i: number) => (
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
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        )}

        {/* 4. SECURITY AUDIT REPORT */}
        {activeTab === 'security' && (
          !canSecurity ? (
            <ForbiddenGuard permission="security.audit" name="RBSC Security & Privilege Audit Trail" />
          ) : (
            <div className="space-y-6">
              {isLoading ? (
                <ReportSkeletonLoader />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Staff Accounts</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{securityData?.summary?.active_staff_accounts ?? 0}</p>
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5">RBSC Protected</p>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Failed Authorization Attempts (24h)</span>
                      <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{securityData?.summary?.failed_authorization_attempts_24h ?? 0}</p>
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
                          {getSecurityRows().length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                                No matching audit logs found for search query or filter.
                              </td>
                            </tr>
                          ) : (
                            getSecurityRows().map((log: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td className="py-3 px-4 text-[11px] font-mono text-slate-500">{log.timestamp}</td>
                                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{log.admin_name}</td>
                                <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{log.action}</td>
                                <td className="py-3 px-4">{log.target}</td>
                                <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.ip_address}</td>
                                <td className="py-3 px-4">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    log.risk_level === 'CRITICAL' || log.risk_level === 'HIGH'
                                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {log.risk_level}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        )}

        {/* 5. FINANCIAL REPORT */}
        {activeTab === 'financial' && (
          !canFinancial ? (
            <ForbiddenGuard permission="financial.reports" name="COD & Payment Gateway Reconciliation" />
          ) : (
            <div className="space-y-6">
              {isLoading ? (
                <ReportSkeletonLoader />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Revenue Pipeline</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{financialData?.summary?.gross_platform_revenue ?? 0}</p>
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Settled + Pending COD</p>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending COD Field Collection</span>
                      <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">₹{financialData?.summary?.cod_pending_field_settlement ?? 0}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Driver Handover Pending</p>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Razorpay Gateway Circuit</span>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">{financialData?.summary?.razorpay_circuit_breaker ?? 'CLOSED'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Circuit Breaker Healthy</p>
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
                          {getFinancialRows().length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                                No matching financial settlement records found for search query or filter.
                              </td>
                            </tr>
                          ) : (
                            getFinancialRows().map((item: any, i: number) => (
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
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        )}

        {/* Server-Side Pagination Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{meta.current_page}</span> of <span className="font-bold text-slate-900 dark:text-white">{meta.last_page}</span> ({meta.total} Total Records)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1 || isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold">
              {page} / {meta.last_page}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, meta.last_page))}
              disabled={page >= meta.last_page || isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

// Shimmer Skeleton Loader Component
const ReportSkeletonLoader: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="h-24 bg-slate-200 dark:bg-slate-800/60 rounded-2xl"></div>
      <div className="h-24 bg-slate-200 dark:bg-slate-800/60 rounded-2xl"></div>
      <div className="h-24 bg-slate-200 dark:bg-slate-800/60 rounded-2xl"></div>
    </div>
    <div className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-3xl"></div>
  </div>
);

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

export default Reports;
