"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRoles, getPermissions, createRole, updateRole, updateRolePermissions, deleteRole } from "@/services/roleService";
import RolePageHeader from "@/components/roles/RolePageHeader";
import RoleCreateForm from "@/components/roles/RoleCreateForm";
import RoleEditModal from "@/components/roles/RoleEditModal";
import RoleViewDrawer from "@/components/roles/RoleViewDrawer";
import RolePermissionsModal from "@/components/roles/RolePermissionsModal";
import RolesTable from "@/components/roles/RolesTable";

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

  const fetchRoles =  async () => {
    setLoading(true);
    try{
      const data = await getRoles();
      setRoles(data);
    }finally{
      setLoading(false);
    }
  }

  const fetchPermissions = async () => {
    const data = await getPermissions();
    setAllPermissions(data);
  }

  const handleCreate = async () => {
    try{
      const created = await createRole(form);
      setRoles((prev) => [...prev,created]);
      setShowCreateForm(false);
    }catch (error : any){
      alert(error.message || "failed to create the role");
    }
  };

  const handleUpdate = async () => {
  if (!editingRole) return;
  try {
    const updated = await updateRole(editingRole.id, editForm);
    setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditingRole(null);
  } catch (error: any) {
    alert(error.message || "Failed to update role");
  }
  };

  const handleUpdatePermissions = async () => {
  if (!editingPermissions) return;
  try {
    const updated = await updateRolePermissions(editingPermissions.id, selectedPermissions);
    setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditingPermissions(null);
  } catch (error: any) {
    alert(error.message || "Failed to update permissions");
  }
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Are you sure you want to detele this role?`)){
      return;
    }
    try {
      await deleteRole(role.id);

      setRoles((prev) => prev.filter((r) => r.id !== role.id));
    }catch (error: any){
      alert(error.message || "faliled to delete role");
    }
  }

  const startEdit = (role: Role) => {
    setEditingRole(role);
    setEditForm({ name: role.name, description: role.description || "" });
  };

  const startEditPermissions = (role: Role) => {
    setEditingPermissions(role);
    const currentPermissionIds =
      role.permissions?.map((p) => p.id || p.name).filter(Boolean) || [];
    setSelectedPermissions(currentPermissionIds);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <RolePageHeader
        onBack={() => router.push("/dashboard")}
        onCreateClick={() => setShowCreateForm(!showCreateForm)}
        showCreateForm={showCreateForm}
      />

      <div className="max-w-7xl mx-auto px-8 pb-8">
        <RoleCreateForm
          visible={showCreateForm}
          onCancel={() => {
            setShowCreateForm(false);
            setForm({ name: "", description: "" });
          }}
          form={form}
          setForm={setForm}
          onSubmit={handleCreate}
          loading={creating}
        />

        <RolesTable
          roles={roles}
          loading={loading}
          onView={setViewRole}
          onEdit={startEdit}
          onEditPermissions={startEditPermissions}
          onDelete={handleDelete}
        />

        <RoleEditModal
          visible={editingRole !== null}
          role={editingRole}
          onCancel={() => setEditingRole(null)}
          form={editForm}
          setForm={setEditForm}
          onSubmit={handleUpdate}
        />

        <RoleViewDrawer
          visible={viewRole !== null}
          role={viewRole}
          onClose={() => setViewRole(null)}
        />

        <RolePermissionsModal
          visible={editingPermissions !== null}
          role={editingPermissions}
          allPermissions={allPermissions}
          selectedPermissions={selectedPermissions}
          onTogglePermission={getPermissions}
          onSubmit={handleUpdatePermissions}
          onCancel={() => {
            setEditingPermissions(null);
            setSelectedPermissions([]);
          }}
        />
      </div>
    </div>
  );
}
