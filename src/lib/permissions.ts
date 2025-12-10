import { getCurrentUser } from "./auth";

/**
 * Extract all permission names from current user
 * Handles both user.permissions and user.role.permissions
 * Returns empty array if no permissions found (safe fallback)
 */
export function getUserPermissions(): string[] {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    const permissions: string[] = [];

    // Check direct permissions on user
    if (Array.isArray((user as any).permissions)) {
      (user as any).permissions.forEach((p: any) => {
        const name = typeof p === "string" ? p : p?.name;
        if (name) permissions.push(name);
      });
    }

    // Check permissions on user.role
    if ((user as any).role && typeof (user as any).role === "object") {
      const rolePermissions = (user as any).role.permissions;
      if (Array.isArray(rolePermissions)) {
        rolePermissions.forEach((p: any) => {
          const name = typeof p === "string" ? p : p?.name;
          if (name) permissions.push(name);
        });
      }
    }

    return [...new Set(permissions)]; // Remove duplicates
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return []; // Safe fallback
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(permission: string): boolean {
  const permissions = getUserPermissions();
  return permissions.includes(permission);
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(permissionList: string[]): boolean {
  const permissions = getUserPermissions();
  return permissionList.some((p) => permissions.includes(p));
}

/**
 * Check if user has ALL of the specified permissions
 */
export function hasAllPermissions(permissionList: string[]): boolean {
  const permissions = getUserPermissions();
  return permissionList.every((p) => permissions.includes(p));
}

/**
 * React Hook for permission checking in components
 * Safe to call even when user is not loaded yet
 */
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
