"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types/user";

type AdminUser = User & {
};

type CreateUserPayload = {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
  roleId: string;
};

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateUserPayload>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roleId: "",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = (await res.json()) as AdminUser[];
          setUsers(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreate = async () => {
    if (!form.email || !form.firstName || !form.password || !form.roleId) {
      alert("Email, first name, password and roleId are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to create user");
        return;
      }
      const created = (await res.json()) as AdminUser;
      setUsers((prev) => [...prev, created]);
      setForm({ email: "", firstName: "", lastName: "", password: "", roleId: "" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Failed to delete user");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <section className="space-y-4 mt-6">
      <h2 className="text-xl font-semibold">User Management</h2>

      <div className="rounded border p-4 space-y-3">
        <h3 className="font-medium">Create New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border rounded px-2 py-1"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Last name (optional)"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1 md:col-span-2"
            placeholder="Role ID (UUID from backend)"
            value={form.roleId}
            onChange={(e) => setForm({ ...form, roleId: e.target.value })}
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create User"}
        </button>
      </div>

      <div className="rounded border p-4">
        <h3 className="font-medium mb-2">Existing Users</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Email</th>
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Role</th>
                  <th className="text-left py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">
                      {u.firstName} {u.lastName ?? ""}
                    </td>
                    <td className="py-2 pr-4">{u.role}</td>
                    <td className="py-2 pr-4">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
