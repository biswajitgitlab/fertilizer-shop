import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import {
  Users as UsersIcon, UserPlus, Search, Filter, ShieldCheck, ShieldAlert,
  Edit, Trash2, Eye, CheckCircle, XCircle, Phone, Mail, RefreshCw, KeyRound
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

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<StaffRecord[]>([]);
  const [stats, setStats] = useState<StaffStats>({ total_users: 0, staff_count: 0, customers_count: 0, unverified_count: 0 });
  const [rolesList, setRolesList] = useState<string[]>(['Super Admin', 'Admin', 'Store Manager', 'Customer Support', 'Warehouse Manager', 'Field Officer']);
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

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchUsers}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title="Refresh Staff Roster"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Add New Staff Account</span>
            </button>
          </div>
        </div>

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

        {/* Staff Roster Table */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
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
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                            title="Inspect Staff Capabilities"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-scale-in text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
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
                    <input
                      type="password"
                      placeholder={editingUser ? 'Leave blank to keep current' : 'Min 6 characters'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-scale-in text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
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

      </div>
    </AdminLayout>
  );
};
