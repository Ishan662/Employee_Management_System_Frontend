import { getCurrentUser } from "./auth";

export function getUserPermissions(): string[] {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    const permissions: string[] = [];

    if (Array.isArray((user as any).permissions)) {
      (user as any).permissions.forEach((p: any) => {
        const name = typeof p === "string" ? p : p?.name;
        if (name) permissions.push(name);
      });
    }

    if ((user as any).role && typeof (user as any).role === "object") {
      const rolePermissions = (user as any).role.permissions;
      if (Array.isArray(rolePermissions)) {
        rolePermissions.forEach((p: any) => {
          const name = typeof p === "string" ? p : p?.name;
          if (name) permissions.push(name);
        });
      }
    }

    return [...new Set(permissions)]; 
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return []; 
  }
}


export function hasPermission(permission: string): boolean {
  const permissions = getUserPermissions();
  return permissions.includes(permission);
}


export function hasAnyPermission(permissionList: string[]): boolean {
  const permissions = getUserPermissions();
  return permissionList.some((p) => permissions.includes(p));
}


export function hasAllPermissions(permissionList: string[]): boolean {
  const permissions = getUserPermissions();
  return permissionList.every((p) => permissions.includes(p));
}


export function usePermissions() {
  const permissions = getUserPermissions();

  return {
    permissions,
    hasPermission: (permission: string) => {
      if (!permissions || permissions.length === 0) return false;
      return permissions.includes(permission);
    },
    hasAnyPermission: (perms: string[]) => {
      if (!permissions || permissions.length === 0) return false;
      return perms.some((p) => permissions.includes(p));
    },
    hasAllPermissions: (perms: string[]) => {
      if (!permissions || permissions.length === 0) return false;
      return perms.every((p) => permissions.includes(p));
    },
  };
}
