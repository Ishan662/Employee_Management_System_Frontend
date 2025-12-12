import { POST } from "@/app/api/employees/route";
import { error } from "console";
import { headers } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const token = localStorage.getItem('token');

export async function getRoles() {
    const res = await fetch("api/roles",{
        headers: token ? {Authorization: `Bearer ${token}`} : undefined,
        })

    if(!res.ok) throw new Error("Failed to fetch roles.")
    return res.json();
}

export async function getPermissions () {
    const res = await fetch("api/permissions", {
        headers: token ? { Authorization: `Bearer ${token}`} : undefined,
     })
    if(!res.ok) throw new Error("Failed to fetch permissions.")
    return res.json();
}

export async function createRole (form: { name: string; description: string}) {
    const res = await fetch("api/roles", {
        method: "POST",
        headers: {
            "Content-type" : "application/json",
            ...(token ? {Authorization: `Bearer ${token}`}: {})
        },
        body: JSON.stringify(form),
    });

    if(!res.ok) throw await res.json();
    return res.json();
}

export async function updateRole(id : string, updates: any){
    const res = await fetch (`/api/roles/${id}`,{
        method: "PATCH",
        headers: {
            "Content-type" : "application/json",
            ...(token ? {Authorization: `Bearer ${token}`}: {})
        },
        body: JSON.stringify(updates),  
    });
    if(!res.ok) throw await res.json();
    return res.json();
}

export async function updateRolePermissions(id: string, permissionIds: string[]) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`/api/roles/${id}/permissions`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ permissionIds }),
  });

  if (!res.ok) throw await res.json();
  return res.json();
}

export async function deleteRole(id: string) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`/api/roles/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) throw await res.json();
}