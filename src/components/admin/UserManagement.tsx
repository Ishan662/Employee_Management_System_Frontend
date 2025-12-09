"use client";

import { useEffect, useState } from "react";
import type { User, UserRole } from "@/types/user";

type AdminUser = User & {};

type CreateUserPayload = {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
};
type UserManagementProps = {
  title: string;
  roleFilter?: Exclude<UserRole, "ADMIN">; // we focus on MANAGER/EMPLOYEE views
};

export function UserManagement({ title, roleFilter }: UserManagementProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<{
    email: string;
    firstName: string;
    lastName?: string;
  }>({ email: "", firstName: "", lastName: "" });
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState<CreateUserPayload>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        const res = await fetch("/api/users", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = (await res.json()) as AdminUser[];
          setUsers(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getRoleName = (u: AdminUser): string => {
    const rawRole: any = (u as any).role;
    if (!rawRole) return "";
    if (typeof rawRole === "string") return rawRole.toUpperCase();
    if (typeof rawRole === "object" && typeof rawRole.name === "string") {
      return rawRole.name.toUpperCase();
    }
    return "";
  };

  const visibleUsers = roleFilter
    ? users.filter((u) => getRoleName(u) === roleFilter.toUpperCase())
    : users;

  const getUserId = (u: AdminUser): string | null => {
    const anyUser: any = u as any;
    return anyUser.id ?? anyUser.userId ?? anyUser._id ?? null;
  };

  const getPermissions = (u: AdminUser): string[] => {
    const anyUser: any = u as any;

    if (Array.isArray(anyUser.permissions)) {
      return anyUser.permissions.map((p: any) =>
        typeof p === "string" ? p : p?.name ?? "",
      ).filter(Boolean);
    }

    if (anyUser.role && Array.isArray(anyUser.role.permissions)) {
      return anyUser.role.permissions
        .map((p: any) => (typeof p === "string" ? p : p?.name ?? ""))
        .filter(Boolean);
    }

    return [];
  };

  const handleCreate = async () => {
    if (!form.email || !form.firstName || !form.password) {
      alert("Email, first name, and password are required");
      return;
    }
    setCreating(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      
      // Automatically determine roleName based on which section we're in
      // roleFilter is "MANAGER" or "EMPLOYEE"
      const roleName = roleFilter || "Employee"; // Default to Employee if no filter
      
      const payload = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        password: form.password,
        roleName: roleName, // Automatically set based on context
      };
      
      const res = await fetch("/api/users/by-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to create user");
        return;
      }
      const created = (await res.json()) as AdminUser;
      setUsers((prev) => [...prev, created]);
      setForm({ email: "", firstName: "", lastName: "", password: "" });
      setShowCreateForm(false);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const id = getUserId(user);
    if (!id) {
      alert("Cannot delete this user because it has no valid id field.");
      return;
    }
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Failed to delete user");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const startEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName ?? "",
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    const id = getUserId(editingUser);
    if (!id) {
      alert("Cannot update this user because it has no valid id field.");
      return;
    }
    setUpdating(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: editForm.email,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to update user");
        return;
      }
      const updated = (await res.json()) as AdminUser;
      setUsers((prev) =>
        prev.map((u) => (getUserId(u) === id ? updated : u)),
      );
      setEditingUser(null);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className="space-y-6 mt-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">{title} Management</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showCreateForm ? "Cancel" : "Create New User"}
        </button>
      </div>

      {/* Create Form - Shown when button clicked */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-4 animate-in fade-in duration-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            Create New {title.slice(0, -1)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <input
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Last name (optional)"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
            <input
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all md:col-span-2"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              {creating ? "Creating..." : "Create User"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setForm({ email: "", firstName: "", lastName: "", password: "" });
              }}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Form - Modal/Inline */}
      {editingUser && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            Edit User
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
            />
            <input
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="First name"
              value={editForm.firstName}
              onChange={(e) =>
                setEditForm({ ...editForm, firstName: e.target.value })
              }
            />
            <input
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all md:col-span-2"
              placeholder="Last name (optional)"
              value={editForm.lastName ?? ""}
              onChange={(e) =>
                setEditForm({ ...editForm, lastName: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            Existing {title}
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Loading {title.toLowerCase()}...</p>
            </div>
          ) : visibleUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No {title.toLowerCase()} found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 pr-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 pr-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 pr-4 text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 pr-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 text-sm text-gray-700">{u.email}</td>
                      <td className="py-3 pr-4 text-sm text-gray-700">
                        {u.firstName} {u.lastName ?? ""}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {getRoleName(u)}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewUser(u)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-all"
                          >
                            View
                          </button>
                          <button
                            onClick={() => startEdit(u)}
                            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-all"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-all"
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
          )}
        </div>
      </div>

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                User Details
              </h3>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {viewUser.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-lg">
                    {viewUser.firstName} {viewUser.lastName ?? ""}
                  </p>
                  <p className="text-sm text-gray-500">{viewUser.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Role</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {getRoleName(viewUser)}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600 block mb-2">Permissions</span>
                  {getPermissions(viewUser).length === 0 ? (
                    <span className="text-sm italic text-gray-400">No permissions assigned</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {getPermissions(viewUser).map((perm) => (
                        <span
                          key={perm}
                          className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setViewUser(null)}
                  className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
