import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { ShieldCheck, Plus, Check, Save, UserCheck, Key, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RoleData {
  id: number;
  name: string;
  user_count: number;
  permissions: string[];
  is_system?: boolean;
}

interface PermissionItem {
  id: number;
  name: string;
  group: string;
  label: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
}

export const Roles: React.FC = () => {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'team'>('matrix');

  // Modal / Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [rData, pData, tData] = await Promise.all([
        adminApi.getRoles(),
        adminApi.getPermissions(),
        adminApi.getTeam()
      ]);
      setRoles(rData);
      setPermissions(pData);
      setTeam(tData);
      if (rData.length > 0 && !selectedRole) {
        setSelectedRole(rData[0]);
      }
    } catch (e) {
      console.error("Failed to load roles and permissions:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePermission = (permName: string) => {
    if (!selectedRole) return;
    if (selectedRole.name === 'Super Admin' || selectedRole.name === 'Admin') {
      toast.error("Super Admin / Core Admin retains full system permissions by default.");
      return;
    }

    const exists = selectedRole.permissions.includes(permName);
    const updatedPerms = exists
      ? selectedRole.permissions.filter(p => p !== permName)
      : [...selectedRole.permissions, permName];

    setSelectedRole({ ...selectedRole, permissions: updatedPerms });

    // Update local list
    setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, permissions: updatedPerms } : r));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      await adminApi.updateRolePermissions(selectedRole.id, selectedRole.permissions);
      toast.success(`Permissions updated for role "${selectedRole.name}"!`);
      fetchData();
    } catch (e) {
      toast.error("Failed to save permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error("Please enter a role name.");
      return;
    }
    setIsSaving(true);
    try {
      await adminApi.createRole({ name: newRoleName.trim(), permissions: newRolePerms });
      toast.success(`Role "${newRoleName}" created successfully!`);
      setShowCreateModal(false);
      setNewRoleName('');
      setNewRolePerms([]);
      fetchData();
    } catch (e) {
      toast.error("Failed to create role.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignUserRole = async (userId: number, roleName: string) => {
    try {
      await adminApi.assignUserRole(userId, roleName);
      toast.success(`Role updated to ${roleName}`);
      fetchData();
    } catch (e) {
      toast.error("Failed to assign role.");
    }
  };

  // Group permissions by module category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const grp = perm.group || 'General';
    if (!acc[grp]) acc[grp] = [];
    acc[grp].push(perm);
    return acc;
  }, {} as Record<string, PermissionItem[]>);

  return (
    <AdminLayout title="Enterprise Roles & Permissions">
      <div className="space-y-6">
        
        {/* Header Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span>Role-Based Access Control (RBAC)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure fine-grained permissions across store management, inventory, orders, diagnoses &amp; analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              Role &amp; Permission Matrix
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              Team Staff Assignment ({team.length})
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Custom Role</span>
            </button>
          </div>
        </div>

        {/* Roles Quick Cards Roster */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => {
            const isSelected = selectedRole?.id === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-white/90 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {role.is_system ? 'System Role' : 'Custom Staff Role'}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400">
                    {role.user_count} Members
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">{role.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {role.permissions.length} active fine-grained permissions
                </p>
                {isSelected && (
                  <div className="mt-3 pt-2 border-t border-emerald-500/20 flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Selected for Editing</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {activeTab === 'matrix' && selectedRole && (
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Permission Matrix for:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{selectedRole.name}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Check or uncheck individual permission capabilities below to tailor access rights for this role.
                </p>
              </div>

              <button
                onClick={handleSavePermissions}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Role Matrix'}</span>
              </button>
            </div>

            {/* Categorized Permissions Checkbox Grid */}
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="bg-slate-50/80 dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/60 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">{category} Module Access</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {perms.map((perm) => {
                      const isChecked = selectedRole.permissions.includes(perm.name);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                              : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.name)}
                            className="w-4 h-4 rounded text-emerald-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <p className="text-xs font-bold">{perm.label}</p>
                            <p className="text-[10px] opacity-75 font-mono">{perm.name}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Roster Tab */}
        {activeTab === 'team' && (
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Administrative Team &amp; Staff Roster</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Staff Name</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  {team.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center font-bold">
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{member.email}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">{member.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={member.role}
                          onChange={(e) => handleAssignUserRole(member.id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{r.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Creating New Custom Role */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-scale-in text-slate-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Create Custom Administrative Role</span>
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRole} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role Title / Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Regional Inspector, Warehouse Associate"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Initial Granted Permissions</label>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    {permissions.map((p) => {
                      const isChecked = newRolePerms.includes(p.name);
                      return (
                        <label key={p.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 p-1 hover:bg-slate-200 dark:hover:bg-slate-900 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setNewRolePerms(prev =>
                                isChecked ? prev.filter(item => item !== p.name) : [...prev, p.name]
                              );
                            }}
                            className="w-3.5 h-3.5 rounded text-emerald-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                          />
                          <span>{p.group}: {p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md"
                  >
                    {isSaving ? 'Creating...' : 'Create Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
