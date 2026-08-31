import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import {
  Users as UsersIcon, UserPlus, Search, Filter, ShieldCheck, ShieldAlert,
  Edit, Trash2, Eye, CheckCircle, XCircle, Phone, Mail, RefreshCw, KeyRound,
  Sliders, Check, RotateCcw, Lock, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StaffRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  roles?: string[];
  is_verified: boolean;
  effective_permissions_count?: number;
  effective_permissions?: string[];
  created_at: string;
}

interface StaffStats {
  total_users: number;
  staff_count: number;
  customers_count: number;
  unverified_count: number;
}

interface StaffDetailData {
  user: StaffRecord & { effective_permissions?: string[] };
  stats: {
    orders_count: number;
    total_spent: number;
    crop_diagnoses_count: number;
  };
  recent_orders: any[];
}

import { PasswordInput } from '../../components/common/PasswordInput';
import { useAuthStore } from '../../store/authStore';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const currentRole = currentUser?.role || '';
  const isSuperAdminOrAdmin = ['Super Admin', 'Admin'].includes(currentRole) || 
    (currentUser?.effective_permissions && (currentUser.effective_permissions.includes('roles.edit') || currentUser.effective_permissions.includes('users.edit')));

  const [users, setUsers] = useState<StaffRecord[]>([]);
  const [stats, setStats] = useState<StaffStats>({ total_users: 0, staff_count: 0, customers_count: 0, unverified_count: 0 });
  const [rolesList, setRolesList] = useState<string[]>([
    'Super Admin', 'Admin', 'Store Manager', 'Customer Support', 'Warehouse Manager', 'Field Officer', 'Staff'
  ]);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userDetailData, setUserDetailData] = useState<StaffDetailData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // RBSC Role & Permission Editor Modal State
  const [showRbscModal, setShowRbscModal] = useState(false);
  const [rbscUser, setRbscUser] = useState<StaffRecord | null>(null);
  const [rbscRole, setRbscRole] = useState<string>('Staff');
  const [rbscPerms, setRbscPerms] = useState<string[]>([]);
  const [systemPermissions, setSystemPermissions] = useState<any[]>([]);

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Admin',
    is_verified: true,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getUsers({
        search,
        role: selectedRole,
        status: selectedStatus,
      });

      if (res?.users?.data) {
        setUsers(res.users.data);
      } else if (Array.isArray(res)) {
        setUsers(res);
      } else {
        setUsers([]);
      }

      if (res?.stats) {
        setStats(res.stats);
      }

      // Fetch dynamic roles list
      const rData = await adminApi.getRoles();
      if (Array.isArray(rData) && rData.length > 0) {
        setRolesList(rData.map((r: any) => r.name).filter((r: string) => r !== 'Customer'));
      }
    } catch (e) {
      console.error("Failed to load staff directory:", e);
      toast.error("Failed to load staff directory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, selectedRole, selectedStatus]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'Admin',
      is_verified: true,
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (user: StaffRecord) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      password: '',
      role: user.role || 'Admin',
      is_verified: Boolean(user.is_verified),
    });
    setShowFormModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      toast.error("Please fill in required fields: Name, Phone, and Email.");
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      toast.error("Password is required for creating new staff accounts.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, formData);
        toast.success(`Staff account for ${formData.name} updated successfully!`);
      } else {
        await adminApi.createUser(formData);
        toast.success(`New staff account for ${formData.name} created successfully!`);
      }
      setShowFormModal(false);
      fetchUsers();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to save staff account.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewDetails = async (user: StaffRecord) => {
    try {
      const data = await adminApi.getUserDetails(user.id);
      setUserDetailData(data);
      setShowDetailModal(true);
    } catch (e) {
      toast.error("Failed to load staff details.");
    }
  };

  const handleOpenRbscModal = async (user: StaffRecord) => {
    setRbscUser(user);
    setRbscRole(user.role || 'Admin');
    try {
      const [details, perms] = await Promise.all([
        adminApi.getUserDetails(user.id),
        adminApi.getPermissions()
      ]);
      setSystemPermissions(perms || []);
      const activePerms = details?.user?.effective_permissions || user.effective_permissions || [];
      setRbscPerms(activePerms);
      setShowRbscModal(true);
    } catch (e) {
      toast.error("Failed to load user permissions matrix.");
    }
  };

  const handleSaveRbsc = async () => {
    if (!rbscUser) return;
    setIsSaving(true);
    try {
      await adminApi.updateUser(rbscUser.id, {
        role: rbscRole,
        permissions: rbscPerms,
      });
      toast.success(`Role & RBSC permissions updated for ${rbscUser.name}!`);
      setShowRbscModal(false);
      fetchUsers();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to update user RBSC permissions.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (user: StaffRecord) => {
    if (!window.confirm(`Are you sure you want to revoke and delete staff account for "${user.name}"?`)) return;

    try {
      await adminApi.deleteUser(user.id);
      toast.success(`Staff account for ${user.name} deleted.`);
      fetchUsers();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to delete staff account.";
      toast.error(msg);
    }
  };

  const demoAccounts = [
    { name: 'Super Admin (Executive)', role: 'Super Admin', email: 'superadmin@fertilizershop.com', pass: 'admin123', perms: 'All 35 Perms', badge: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300' },
    { name: 'Admin SarkarFertilizer', role: 'Admin', email: 'admin@fertilizershop.com', pass: 'admin123', perms: 'All 35 Perms', badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300' },
    { name: 'Vikram Singh', role: 'Store Manager', email: 'store.manager@fertilizershop.com', pass: 'staff123', perms: '13 Perms', badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300' },
    { name: 'Ananya Sharma', role: 'Customer Support', email: 'support@fertilizershop.com', pass: 'staff123', perms: '6 Perms', badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300' },
    { name: 'Rajesh Kumar', role: 'Warehouse Manager', email: 'warehouse@fertilizershop.com', pass: 'staff123', perms: '6 Perms', badge: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300' },
    { name: 'Priya Verma', role: 'Field Officer', email: 'field.officer@fertilizershop.com', pass: 'staff123', perms: '5 Perms', badge: 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-300' },
    { name: 'Amit Das', role: 'Staff', email: 'staff@fertilizershop.com', pass: 'staff123', perms: '5 Perms', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300' },
    { name: 'Ramesh Patel', role: 'Customer', email: 'ramesh.patel@agri.com', pass: 'password123', perms: 'Storefront Portal', badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300' },
  ];

  return (
    <AdminLayout title="Staff & Internal User Management">
      <div className="space-y-6">

        {/* Top Header Card */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Staff &amp; Admin User Management</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Internal staff members, system administrators, role assignments, and RBAC security credentials.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{showDemoAccounts ? 'Hide Demo Roster' : 'Show Demo Roster'}</span>
            </button>

            <button
              onClick={fetchUsers}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title="Refresh Staff Roster"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {isSuperAdminOrAdmin && (
              <button
                onClick={handleOpenCreateModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>Add New Staff Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Demo Staff & Admin User Credentials Hub */}
        {showDemoAccounts && (
          <div className="bg-gradient-to-br from-emerald-950/90 via-slate-900/90 to-teal-950/90 backdrop-blur-md rounded-3xl border border-emerald-500/30 p-5 shadow-xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
                <h3 className="text-sm font-black tracking-wide text-white uppercase truncate">System Demo Users Roster &amp; RBAC Credentials</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                8 Demo Accounts Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {demoAccounts.map((account, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/80 hover:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${account.badge}`}>
                      {account.role}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">{account.perms}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-white truncate">{account.name}</h4>
                    <p className="text-[11px] font-mono text-slate-300 truncate">{account.email}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Pass: <strong className="text-emerald-400">{account.pass}</strong></p>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${account.email} | ${account.pass}`);
                      toast.success(`Copied credentials for ${account.name}!`);
                    }}
                    className="w-full text-[10px] font-bold py-1 px-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Copy Credentials</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roster Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Internal Staff Roster</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.staff_count}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Active administrative team members</p>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registered Storefront Customers</span>
              <UsersIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.customers_count}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Managed separately in Customer CRM</p>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Security Guard</span>
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">RBAC Active</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Strict role &amp; permission protection</p>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search staff name, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                {rolesList.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="VERIFIED">Verified Accounts</option>
              <option value="UNVERIFIED">Unverified Accounts</option>
            </select>
          </div>
        </div>

        {/* Staff Roster Container: Mobile Cards (sm:hidden) & Desktop Table (hidden sm:block) */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl overflow-hidden">
          
          {/* Mobile Staff Cards View (Visible under sm) */}
          <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading staff accounts...</div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No staff accounts found matching query.</div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="p-4 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center font-black text-sm uppercase shrink-0">
                        {user.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">ID #{user.id}</p>
                      </div>
                    </div>

                    <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      {user.role}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs bg-emerald-50/50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40">
                    <p className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{user.phone || 'N/A'}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    <div>
                      {user.is_verified ? (
                        <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-500 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        title="Inspect Capabilities"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-500 hover:bg-blue-50 cursor-pointer"
                        title="Edit Account"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (Hidden under sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Permissions Count</th>
                  <th className="py-3.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Loading staff accounts...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">No staff accounts found matching query.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center font-black shrink-0 uppercase">
                          {user.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Staff ID #{user.id}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{user.phone || 'N/A'}</span>
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block truncate max-w-[140px]">
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {user.is_verified ? (
                          <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified Staff
                          </span>
                        ) : (
                          <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Pending Verification
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {user.effective_permissions_count ?? 0} Granted Capabilities
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {isSuperAdminOrAdmin && (
                            <button
                              onClick={() => handleOpenRbscModal(user)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer transition-all border border-emerald-300 dark:border-emerald-800"
                              title="Edit Role & RBSC Permissions Matrix"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                            title="Inspect Staff Capabilities"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {isSuperAdminOrAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(user)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                                title="Edit Staff Credentials"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                                title="Revoke & Delete Staff Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Creating or Editing Staff Account */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-scale-in text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 min-w-0">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
                  <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{editingUser ? `Edit Staff Credentials: ${editingUser.name}` : 'Create New Staff Account'}</span>
                </h3>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold shrink-0 p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Admin"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone *</label>
                    <input
                      type="text"
                      placeholder="e.g. +919876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Corporate Email *</label>
                    <input
                      type="email"
                      placeholder="e.g. staff@fertilizershop.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {editingUser ? 'New Password (Optional)' : 'Staff Password *'}
                    </label>
                    <PasswordInput
                      icon={null}
                      placeholder={editingUser ? 'Leave blank to keep current' : 'Min 6 characters'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                      required={!editingUser}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {rolesList.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_verified}
                        onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Mark Account as Verified Staff</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Saving Account...' : editingUser ? 'Update Staff Account' : 'Create Staff Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Inspecting Staff Permissions */}
        {showDetailModal && userDetailData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl animate-scale-in text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center font-black text-lg uppercase shrink-0">
                    {userDetailData.user.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{userDetailData.user.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userDetailData.user.email} • {userDetailData.user.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold shrink-0 p-1"
                >
                  ✕
                </button>
              </div>

              {/* Effective Granted Capabilities Badges */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-2">Granted RBAC System Capabilities</h4>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  {(userDetailData.user.effective_permissions || []).length > 0 ? (
                    (userDetailData.user.effective_permissions || []).map(perm => (
                      <span key={perm} className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono">
                        {perm}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Super Admin / Standard Staff permissions active.</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Editing User Role & RBSC Direct Permissions */}
        {showRbscModal && rbscUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-5 sm:p-6 space-y-5 shadow-2xl animate-scale-in text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-lg">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>RBSC Role &amp; Permissions Matrix</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase">
                        {rbscUser.name}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure staff role assignment and override granular system capabilities.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRbscModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Role Selection Bar */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Assigned Administrative Staff Role
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <select
                    value={rbscRole}
                    onChange={(e) => setRbscRole(e.target.value)}
                    className="w-full sm:w-64 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {rolesList.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (rbscRole === 'Super Admin' || rbscRole === 'Admin') {
                          const allNames = (systemPermissions || []).map(p => p.name);
                          setRbscPerms(allNames.length > 0 ? allNames : [
                            'products.view', 'products.create', 'products.edit', 'products.delete',
                            'orders.view', 'orders.edit', 'orders.status', 'orders.delete',
                            'users.view', 'users.create', 'users.edit', 'users.delete',
                            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
                            'customers.view', 'customers.edit', 'customers.delete',
                            'analytics.view', 'analytics.export',
                            'notifications.view', 'notifications.send',
                            'inventory.view', 'inventory.update',
                            'crop_plans.view', 'crop_plans.manage'
                          ]);
                        } else {
                          setRbscPerms([
                            'products.view', 'orders.view', 'customers.view', 'notifications.view', 'inventory.view'
                          ]);
                        }
                        toast.success(`Reset capabilities to default for ${rbscRole}`);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset Role Defaults</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const allNames = (systemPermissions && systemPermissions.length > 0) ? systemPermissions.map(p => p.name) : [
                          'products.view', 'products.create', 'products.edit', 'products.delete',
                          'orders.view', 'orders.edit', 'orders.status', 'orders.delete',
                          'users.view', 'users.create', 'users.edit', 'users.delete',
                          'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
                          'customers.view', 'customers.edit', 'customers.delete',
                          'analytics.view', 'analytics.export',
                          'notifications.view', 'notifications.send',
                          'inventory.view', 'inventory.update',
                          'crop_plans.view', 'crop_plans.manage'
                        ];
                        setRbscPerms(allNames);
                        toast.success("Granted all 35 permissions!");
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Grant All</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Granular Module Permission Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Granular Capability Overrides ({rbscPerms.length} Active)
                  </h4>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    Effective RBAC Guard Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                  {Object.entries(
                    (systemPermissions && systemPermissions.length > 0)
                      ? systemPermissions.reduce((acc: any, p: any) => {
                          const grp = p.group || 'System Capabilities';
                          if (!acc[grp]) acc[grp] = [];
                          acc[grp].push(p);
                          return acc;
                        }, {})
                      : {
                          'Products Module': [
                            { name: 'products.view', label: 'View Products Catalog' },
                            { name: 'products.create', label: 'Create New Products' },
                            { name: 'products.edit', label: 'Edit Products & Pricing' },
                            { name: 'products.delete', label: 'Delete Products' },
                          ],
                          'Orders Module': [
                            { name: 'orders.view', label: 'View Customer Orders' },
                            { name: 'orders.edit', label: 'Edit Order Items' },
                            { name: 'orders.status', label: 'Update Fulfill Status' },
                            { name: 'orders.delete', label: 'Cancel & Delete Orders' },
                          ],
                          'Staff & Admin Users': [
                            { name: 'users.view', label: 'View Staff Roster' },
                            { name: 'users.create', label: 'Create Staff Accounts' },
                            { name: 'users.edit', label: 'Edit Staff Credentials' },
                            { name: 'users.delete', label: 'Delete Staff Accounts' },
                          ],
                          'Roles & Permissions': [
                            { name: 'roles.view', label: 'View Roles Matrix' },
                            { name: 'roles.create', label: 'Create Custom Roles' },
                            { name: 'roles.edit', label: 'Edit Role Permissions' },
                            { name: 'roles.delete', label: 'Delete System Roles' },
                          ],
                          'Customers CRM': [
                            { name: 'customers.view', label: 'View Farmer Profiles' },
                            { name: 'customers.edit', label: 'Edit Farmer Accounts' },
                            { name: 'customers.delete', label: 'Delete Farmer Records' },
                          ],
                          'Analytics & Reports': [
                            { name: 'analytics.view', label: 'View Sales Analytics' },
                            { name: 'analytics.export', label: 'Export Reports' },
                            { name: 'reports.regulatory', label: 'Government Subsidy & Chemical Ledger' },
                            { name: 'agronomy.reports', label: 'Regional Disease Outbreak Telemetry' },
                            { name: 'security.audit', label: 'RBSC Security Audit & Privilege Trail' },
                            { name: 'financial.reports', label: 'COD & Payment Circuit Settlement' },
                          ],
                          'Sentinel Alerts': [
                            { name: 'notifications.view', label: 'View Privileged Notices' },
                            { name: 'notifications.send', label: 'Dispatch System Alerts' },
                          ],
                          'Inventory Control': [
                            { name: 'inventory.view', label: 'View Stock Inventory' },
                            { name: 'inventory.update', label: 'Update Stock Levels' },
                          ],
                          'Crop Plans & Triage': [
                            { name: 'crop_plans.view', label: 'View Crop Plans' },
                            { name: 'crop_plans.manage', label: 'Manage Crop Plans' },
                          ],
                        }
                  ).map(([groupName, permsArr]: [string, any]) => (
                    <div key={groupName} className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 space-y-2">
                      <h5 className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{groupName}</h5>
                      <div className="space-y-1.5">
                        {permsArr.map((perm: any) => {
                          const isChecked = rbscPerms.includes(perm.name);
                          return (
                            <label
                              key={perm.name}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-900 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setRbscPerms(prev =>
                                      isChecked
                                        ? prev.filter(p => p !== perm.name)
                                        : [...prev, perm.name]
                                    );
                                  }}
                                  className="w-4 h-4 rounded text-emerald-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-emerald-500 shrink-0 cursor-pointer"
                                />
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{perm.label || perm.name}</span>
                              </div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono shrink-0 ${isChecked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                {isChecked ? 'ALLOWED' : 'DENIED'}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {rbscPerms.length} capabilities will be granted to {rbscUser.name}.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRbscModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRbsc}
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>{isSaving ? 'Saving Matrix...' : 'Save RBSC Permissions'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
