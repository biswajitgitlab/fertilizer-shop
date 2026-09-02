import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';
import { ShieldCheck, Plus, Check, Save, UserCheck, Key, Sparkles, SlidersHorizontal, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

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
  role_permissions?: string[];
  direct_permissions?: string[];
  permissions?: string[];
}

export const Roles: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const currentRole = currentUser?.role || '';
  const isSuperAdminOrAdmin = ['Super Admin', 'Admin'].includes(currentRole) || 
    (currentUser?.effective_permissions && (currentUser.effective_permissions.includes('roles.edit') || currentUser.effective_permissions.includes('users.edit')));

  const [roles, setRoles] = useState<RoleData[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'team'>('matrix');

  // Modal / Form state for Roles
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Modal / Form state for Per-User Direct Permissions
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<TeamMember | null>(null);
  const [userDirectPerms, setUserDirectPerms] = useState<string[]>([]);
  const [showUserPermsModal, setShowUserPermsModal] = useState(false);

  const fetchData = async () => {
    try {
      const [rData, pData, tData] = await Promise.all([
        adminApi.getRoles(),
        adminApi.getPermissions(),
        adminApi.getTeam()
      ]);
      const validRoles = Array.isArray(rData) ? rData : [];
      const validPerms = Array.isArray(pData) ? pData : [];
      const validTeam = Array.isArray(tData) ? tData : [];

      setRoles(validRoles);
      setPermissions(validPerms);
      setTeam(validTeam);
      if (validRoles.length > 0 && !selectedRole) {
        setSelectedRole(validRoles[0]);
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
    if (!isSuperAdminOrAdmin) {
      toast.error("Access Denied: Only Super Admin and Admin accounts can edit role permissions.");
      return;
    }
    if (!selectedRole) return;
    if (selectedRole.name === 'Super Admin' || selectedRole.name === 'Admin') {
      toast.error("Super Admin / Core Admin retains full system permissions by default.");
      return;
    }

    const currentPerms = Array.isArray(selectedRole.permissions) ? selectedRole.permissions : [];
    const exists = currentPerms.includes(permName);
    const updatedPerms = exists
      ? currentPerms.filter(p => p !== permName)
      : [...currentPerms, permName];

    setSelectedRole({ ...selectedRole, permissions: updatedPerms });

    // Update local list
    setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, permissions: updatedPerms } : r));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      const permsToSave = Array.isArray(selectedRole.permissions) ? selectedRole.permissions : [];
      await adminApi.updateRolePermissions(selectedRole.id, permsToSave);
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

  const handleOpenUserPermsModal = (member: TeamMember) => {
    setSelectedUserForPerms(member);
    // Initialize with current net allowed effective permissions for this user
    setUserDirectPerms(member.permissions || []);
    setShowUserPermsModal(true);
  };

  const handleToggleUserDirectPerm = (permName: string) => {
    setUserDirectPerms(prev =>
      prev.includes(permName) ? prev.filter(p => p !== permName) : [...prev, permName]
    );
  };

  const handleSaveUserDirectPerms = async () => {
    if (!selectedUserForPerms) return;
    setIsSaving(true);
    try {
      await adminApi.updateUserPermissions(selectedUserForPerms.id, userDirectPerms);
      toast.success(`Custom permissions updated for ${selectedUserForPerms.name}!`);
      setShowUserPermsModal(false);
      fetchData();
    } catch (e) {
      toast.error("Failed to update custom permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  // Group permissions by module category safely
  const safePermissions = Array.isArray(permissions) ? permissions : [];
  const groupedPermissions = safePermissions.reduce((acc, perm) => {
    const grp = perm.group || 'General';
    if (!acc[grp]) acc[grp] = [];
    acc[grp].push(perm);
    return acc;
  }, {} as Record<string, PermissionItem[]>);

  return (
    <AdminLayout title="Enterprise Roles & Permissions">
      <div className="space-y-6">
        
        {/* Header Bar */}
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Role &amp; Per-User Access Control</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Assign core roles and configure custom user-specific direct permission overrides for individual team members.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              Role &amp; Permission Matrix
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              Team Staff &amp; Custom Overrides ({team.length})
            </button>
            {isSuperAdminOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>New Role</span>
              </button>
            )}
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
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-w-0 ${
                  isSelected
                    ? 'bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-white/90 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 min-w-0 truncate">
                    <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{role.is_system ? 'System Role' : 'Custom Role'}</span>
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 shrink-0">
                    {role.user_count} Members
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 truncate" title={role.name}>{role.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {(role.permissions || []).length} active permissions
                </p>
                {isSelected && (
                  <div className="mt-3 pt-2 border-t border-emerald-500/20 flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 min-w-0">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Selected for Editing</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!isSuperAdminOrAdmin && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Read-Only Mode: Role &amp; RBSC Permission modifications are restricted to Super Admin &amp; Admin accounts only.</span>
          </div>
        )}

        {activeTab === 'matrix' && selectedRole && (
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl p-4 sm:p-6 space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4 min-w-0">
              <div className="min-w-0">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                  <span>Permission Matrix for Role:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 truncate">{selectedRole.name}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Check or uncheck individual permission capabilities below to tailor access rights for this base role.
                </p>
              </div>

              {isSuperAdminOrAdmin && (
                <button
                  onClick={handleSavePermissions}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Save className="w-4 h-4 shrink-0" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Role Matrix'}</span>
                </button>
              )}
            </div>

            {/* Categorized Permissions Checkbox Grid */}
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="bg-emerald-50/40 dark:bg-slate-800/60 rounded-2xl p-4 border border-emerald-200/60 dark:border-emerald-500/20 space-y-3 overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-emerald-200/60 dark:border-slate-700/60 pb-2 min-w-0">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide truncate">{category} Module Access</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {(perms as PermissionItem[]).map((perm) => {
                      const isChecked = Array.isArray(selectedRole.permissions) && selectedRole.permissions.includes(perm.name);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer min-w-0 overflow-hidden ${
                            isChecked
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                              : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.name)}
                            className="w-4 h-4 rounded text-emerald-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate" title={perm.label}>{perm.label}</p>
                            <p className="text-[10px] opacity-75 font-mono truncate" title={perm.name}>{perm.name}</p>
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

        {/* Team Roster Tab with Custom Direct User Permissions */}
        {activeTab === 'team' && (
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between min-w-0">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Staff Roster &amp; Custom Direct Permissions</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Staff Member</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4">Role Permissions</th>
                    <th className="py-3.5 px-4">Custom Direct Permissions</th>
                    <th className="py-3.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  {team.map((member) => {
                    const directCount = (member.direct_permissions || []).length;
                    const roleCount = (member.role_permissions || member.permissions || []).length;

                    return (
                      <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                            {member.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{member.email}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block truncate max-w-[150px]">
                            {member.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            {roleCount} Inherited Perms
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {directCount > 0 ? (
                            <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                              <SlidersHorizontal className="w-3 h-3" />
                              {directCount} Custom Direct Override{directCount > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">None (Uses Role Default)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 flex items-center gap-2">
                          <select
                            value={member.role}
                            disabled={!isSuperAdminOrAdmin}
                            onChange={(e) => handleAssignUserRole(member.id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[140px] truncate disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{r.name}</option>
                            ))}
                          </select>

                          {isSuperAdminOrAdmin && (
                            <button
                              onClick={() => handleOpenUserPermsModal(member)}
                              className="bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
                              title="Customize individual permissions for this specific user"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Custom Perms</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Custom Per-User Direct Permissions Override */}
        {showUserPermsModal && selectedUserForPerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-scale-in text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 min-w-0">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
                    <SlidersHorizontal className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">Custom Direct Permissions for: {selectedUserForPerms.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Assigned Role: <strong className="text-emerald-600 dark:text-emerald-400">{selectedUserForPerms.role}</strong>. Select specific permissions below to override or extend permissions for this user.
                  </p>
                </div>
                <button
                  onClick={() => setShowUserPermsModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold shrink-0 p-1"
                >
                  ✕
                </button>
              </div>

              {/* Categorized Permissions Grid for User */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="bg-slate-50/80 dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/60 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">{category} Capabilities</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(perms as PermissionItem[]).map((perm) => {
                        const isRoleDefault = (selectedUserForPerms.role_permissions || []).includes(perm.name);
                        const isAllowed = userDirectPerms.includes(perm.name);
                        const isRevoked = isRoleDefault && !isAllowed;
                        const isExtraGranted = !isRoleDefault && isAllowed;

                        return (
                          <label
                            key={perm.id}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer min-w-0 ${
                              isRevoked
                                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'
                                : isExtraGranted
                                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
                                : isAllowed
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                                : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isAllowed}
                              onChange={() => handleToggleUserDirectPerm(perm.name)}
                              className={`w-4 h-4 rounded border-slate-300 dark:border-slate-700 cursor-pointer shrink-0 ${
                                isRevoked
                                  ? 'text-rose-600 focus:ring-rose-500'
                                  : 'text-emerald-600 focus:ring-emerald-500'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate flex items-center justify-between gap-1">
                                <span className="truncate">{perm.label}</span>
                                {isRevoked ? (
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 shrink-0">
                                    Revoked / Blocked
                                  </span>
                                ) : isExtraGranted ? (
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 shrink-0">
                                    Extra Granted
                                  </span>
                                ) : isRoleDefault ? (
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 shrink-0">
                                    Role Default
                                  </span>
                                ) : null}
                              </p>
                              <p className="text-[10px] opacity-75 font-mono truncate">{perm.name}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {userDirectPerms.length} custom direct override permission(s) selected for {selectedUserForPerms.name}.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUserPermsModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveUserDirectPerms}
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save User Custom Overrides'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Creating New Custom Role */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-scale-in text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 min-w-0">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">Create Custom Administrative Role</span>
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold shrink-0 p-1"
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
                    {safePermissions.map((p) => {
                      const isChecked = newRolePerms.includes(p.name);
                      return (
                        <label key={p.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 p-1 hover:bg-slate-200 dark:hover:bg-slate-900 rounded cursor-pointer min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setNewRolePerms(prev =>
                                isChecked ? prev.filter(item => item !== p.name) : [...prev, p.name]
                              );
                            }}
                            className="w-3.5 h-3.5 rounded text-emerald-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 shrink-0"
                          />
                          <span className="truncate">{p.group}: {p.label}</span>
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
