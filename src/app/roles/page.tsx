"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Role = {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
};

type Permission = {
  id: string;
  name: string;
  description?: string;
};

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewRole, setViewRole] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/roles", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/permissions", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Loaded permissions:", data);
        setAllPermissions(data);
      } else {
        console.error("Failed to fetch permissions:", res.status);
        // Continue without permissions, don't block UI
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      // Continue without permissions, don't block UI
    }
  };

  const handleCreate = async () => {
    if (!form.name) {
      alert("Role name is required");
      return;
    }
    setCreating(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to create role");
        return;
      }
      const created = await res.json();
      setRoles((prev) => [...prev, created]);
      setForm({ name: "", description: "" });
      setShowCreateForm(false);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingRole) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/roles/${editingRole.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to update role");
        return;
      }
      const updated = await res.json();
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditingRole(null);
    } catch (error) {
      alert("Failed to update role");
    }
  };

  const startEditPermissions = (role: Role) => {
    setEditingPermissions(role);
    // Set currently selected permissions - use name as fallback if id is missing
    const currentPermissionIds = role.permissions?.map((p) => p.id || p.name).filter(Boolean) || [];
    setSelectedPermissions(currentPermissionIds);
    console.log("Starting permission edit for:", role.name);
    console.log("Current permissions:", currentPermissionIds);
  };

  const handleUpdatePermissions = async () => {
    if (!editingPermissions) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/roles/${editingPermissions.id}/permissions`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ permissionIds: selectedPermissions }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to update permissions");
        return;
      }
      const updated = await res.json();
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditingPermissions(null);
      setSelectedPermissions([]);
    } catch (error) {
      alert("Failed to update permissions");
    }
  };

  const togglePermission = (permissionId: string) => {
    if (!permissionId) {
      console.error("Permission ID is undefined!");
      return;
    }
    console.log("Toggling permission:", permissionId);
    setSelectedPermissions((prev) => {
      const newSelection = prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId];
      console.log("New selection:", newSelection);
      return newSelection;
    });
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`))
      return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/roles/${role.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to delete role");
        return;
      }
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
    } catch (error) {
      alert("Failed to delete role");
    }
  };

  const startEdit = (role: Role) => {
    setEditingRole(role);
    setEditForm({
      name: role.name,
      description: role.description || "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Roles Management</h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Create Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">Roles</h2>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showCreateForm ? "Cancel" : "Create New Role"}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Create New Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Role name (e.g., Manager, Employee)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2"
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 hover:shadow-lg transition-all"
              >
                {creating ? "Creating..." : "Create Role"}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setForm({ name: "", description: "" });
                }}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Edit Role</h3>
                <button
                  onClick={() => setEditingRole(null)}
                  className="text-white/80 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingRole(null)}
                    className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Role Details</h3>
                <button
                  onClick={() => setViewRole(null)}
                  className="text-white/80 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Role Name</span>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{viewRole.name}</p>
                </div>
                {viewRole.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Description</span>
                    <p className="text-gray-800 mt-1">{viewRole.description}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600 block mb-2">Permissions</span>
                  {!viewRole.permissions || viewRole.permissions.length === 0 ? (
                    <span className="text-sm italic text-gray-400">No permissions assigned</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {viewRole.permissions.map((perm, index) => (
                        <span
                          key={perm.id || perm.name || index}
                          className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium"
                        >
                          {perm.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setViewRole(null)}
                  className="w-full px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Permissions Modal */}
        {editingPermissions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Manage Permissions - {editingPermissions.name}
                </h3>
                <button
                  onClick={() => {
                    setEditingPermissions(null);
                    setSelectedPermissions([]);
                  }}
                  className="text-white/80 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <p className="text-sm text-gray-600 mb-4">
                  Select the permissions to assign to this role. Users with this role will have access to all selected permissions.
                </p>
                {allPermissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No permissions available</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allPermissions.map((permission, index) => {
                      const permId = permission.id || permission.name;
                      return (
                        <label
                          key={permId || index}
                          className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permId)}
                            onChange={() => togglePermission(permId)}
                            className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{permission.name}</p>
                            {permission.description && (
                              <p className="text-sm text-gray-500 mt-1">{permission.description}</p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3">
                <button
                  onClick={handleUpdatePermissions}
                  className="flex-1 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Save Permissions ({selectedPermissions.length})
                </button>
                <button
                  onClick={() => {
                    setEditingPermissions(null);
                    setSelectedPermissions([]);
                  }}
                  className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Roles List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">All Roles</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">Loading roles...</p>
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No roles found.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 pr-4 text-sm font-semibold text-gray-700">Role Name</th>
                        <th className="text-left py-3 pr-4 text-sm font-semibold text-gray-700">Description</th>
                        <th className="text-left py-3 pr-4 text-sm font-semibold text-gray-700">Permissions</th>
                        <th className="text-left py-3 pr-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((role) => (
                        <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 pr-4 text-sm font-medium text-gray-800">{role.name}</td>
                          <td className="py-3 pr-4 text-sm text-gray-600">{role.description || "-"}</td>
                          <td className="py-3 pr-4 text-sm text-gray-600">
                            {role.permissions?.length || 0} permissions
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setViewRole(role)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium"
                              >
                                View
                              </button>
                              <button
                                onClick={() => startEditPermissions(role)}
                                className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs font-medium"
                              >
                                Permissions
                              </button>
                              <button
                                onClick={() => startEdit(role)}
                                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => handleDelete(role)}
                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {roles.map((role) => (
                    <div key={role.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                      <div>
                        <p className="font-semibold text-gray-800 text-lg">{role.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{role.description || "No description"}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {role.permissions?.length || 0} permissions
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => setViewRole(role)}
                          className="flex-1 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-300"
                        >
                          View
                        </button>
                        <button
                          onClick={() => startEditPermissions(role)}
                          className="flex-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium"
                        >
                          Perms
                        </button>
                        <button
                          onClick={() => startEdit(role)}
                          className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
                          className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
