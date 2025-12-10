# Permission-Based UI Control Implementation Guide

## Overview
The system now uses **granular permission-based access control** instead of simple role-based checks. This allows flexible assignment of specific capabilities to users/roles.

---

## Current System Behavior

### Before (Role-Based)
```tsx
// Old way - All or nothing
{isAdmin && <button>Delete</button>}
```

### After (Permission-Based)
```tsx
// New way - Granular control
{hasPermission("DELETE_USER") && <button>Delete</button>}
```

---

## How It Works

### 1. Data Structure

**Backend sends user with role and permissions:**
```json
{
  "id": "123",
  "email": "manager@example.com",
  "firstName": "John",
  "role": {
    "name": "MANAGER",
    "permissions": [
      { "name": "VIEW_USERS" },
      { "name": "CREATE_USER" },
      { "name": "VIEW_EMPLOYEES" }
    ]
  }
}
```

**Or with direct permissions on user:**
```json
{
  "id": "123",
  "email": "john@example.com",
  "permissions": [
    { "name": "VIEW_USERS" },
    { "name": "UPDATE_USER" }
  ]
}
```

### 2. Permission Helper Functions

**Location:** `src/lib/permissions.ts`

**Functions:**
- `getUserPermissions()` - Extracts all permission names from current user
- `hasPermission(name)` - Checks if user has specific permission
- `hasAnyPermission([names])` - Checks if user has any of the permissions
- `hasAllPermissions([names])` - Checks if user has all permissions
- `usePermissions()` - React hook for components

**How it extracts permissions:**
1. Checks `user.permissions` array (direct on user)
2. Checks `user.role.permissions` array (through role)
3. Handles both string arrays and object arrays: `"DELETE_USER"` or `{name: "DELETE_USER"}`
4. Returns unique list of permission names

### 3. Usage in Components

**UserManagement Component:**
```tsx
import { usePermissions } from "@/lib/permissions";

export function UserManagement({ title, roleFilter }: UserManagementProps) {
  const { hasPermission } = usePermissions();
  
  // Check permissions once at component level
  const canCreateUser = hasPermission("CREATE_USER");
  const canUpdateUser = hasPermission("UPDATE_USER");
  const canDeleteUser = hasPermission("DELETE_USER");
  const canToggleUserStatus = hasPermission("TOGGLE_USER_STATUS");

  return (
    <>
      {canCreateUser && <button>Create User</button>}
      {canUpdateUser && <button>Update</button>}
      {canDeleteUser && <button>Delete</button>}
      {canToggleUserStatus ? <button>Toggle</button> : <span>Read-only</span>}
    </>
  );
}
```

**Dashboard Component:**
```tsx
import { usePermissions } from "@/lib/permissions";

export default function DashboardPage() {
  const { hasPermission } = usePermissions();

  return (
    <header>
      {hasPermission("MANAGE_ROLES") && (
        <button>Manage Roles</button>
      )}
    </header>
  );
}
```

---

## Standard Permission Names

### User Management Permissions
```
VIEW_USERS          - Can view user list
CREATE_USER         - Can create new users
UPDATE_USER         - Can update existing users
DELETE_USER         - Can delete users
TOGGLE_USER_STATUS  - Can activate/deactivate users
```

### Role Management Permissions
```
VIEW_ROLES          - Can view roles
CREATE_ROLE         - Can create new roles
UPDATE_ROLE         - Can update existing roles
DELETE_ROLE         - Can delete roles
MANAGE_ROLES        - Full role management access (includes all above)
```

### Profile Permissions
```
VIEW_OWN_PROFILE    - Can view own profile
UPDATE_OWN_PROFILE  - Can update own profile
VIEW_ALL_PROFILES   - Can view any user's profile
```

### Employee-Specific Permissions
```
VIEW_EMPLOYEES      - Can view employee list
CREATE_EMPLOYEE     - Can create new employees
UPDATE_EMPLOYEE     - Can update employees
DELETE_EMPLOYEE     - Can delete employees
```

---

## Example Role Configurations

### ADMIN Role
```json
{
  "name": "ADMIN",
  "permissions": [
    "VIEW_USERS",
    "CREATE_USER",
    "UPDATE_USER",
    "DELETE_USER",
    "TOGGLE_USER_STATUS",
    "MANAGE_ROLES",
    "VIEW_EMPLOYEES",
    "CREATE_EMPLOYEE",
    "UPDATE_EMPLOYEE",
    "DELETE_EMPLOYEE"
  ]
}
```

### MANAGER Role
```json
{
  "name": "MANAGER",
  "permissions": [
    "VIEW_USERS",
    "CREATE_USER",
    "VIEW_EMPLOYEES",
    "CREATE_EMPLOYEE"
  ]
}
```

### EMPLOYEE Role
```json
{
  "name": "EMPLOYEE",
  "permissions": [
    "VIEW_OWN_PROFILE",
    "UPDATE_OWN_PROFILE"
  ]
}
```

---

## Migration from Role-Based to Permission-Based

### What Changed

**1. User Type (`src/types/user.ts`)**
```tsx
// Before
export interface User {
  role: UserRole; // Just string: "ADMIN" | "MANAGER" | "EMPLOYEE"
}

// After
export interface User {
  role: UserRole | Role; // Can be string OR full Role object with permissions
  permissions?: Permission[]; // Optional direct permissions
}
```

**2. UserManagement Props**
```tsx
// Before
interface UserManagementProps {
  title: string;
  roleFilter?: UserRole;
  isAdmin: boolean; // ❌ Removed
}

// After
interface UserManagementProps {
  title: string;
  roleFilter?: UserRole;
  // No isAdmin prop - uses permissions internally
}
```

**3. Dashboard Usage**
```tsx
// Before
<UserManagement title="Employees" roleFilter="Employee" isAdmin={true} />
<UserManagement title="Employees" roleFilter="Employee" isAdmin={false} />

// After
<UserManagement title="Employees" roleFilter="Employee" />
// Same component, behavior changes based on user's permissions
```

---

## Benefits

### 1. Flexibility
- Can give MANAGER some admin permissions (e.g., UPDATE_USER) without full admin access
- Can create custom roles with specific permission combinations
- No code changes needed when permissions change

### 2. Granular Control
- Instead of "all admin actions" or "no admin actions"
- Each action independently controlled: delete but not update, etc.

### 3. Scalability
- Add new permissions without changing component code
- Backend controls all permission logic
- Frontend just checks if permission exists

### 4. Maintainability
- Single source of truth (backend)
- No hardcoded role checks scattered in code
- Easy to audit what permissions exist

---

## Backend Requirements

**Your NestJS backend must:**

1. **Send permissions in JWT or user object:**
   ```typescript
   // Either on role:
   {
     role: {
       name: "MANAGER",
       permissions: [{ name: "VIEW_USERS" }, { name: "CREATE_USER" }]
     }
   }
   
   // Or directly on user:
   {
     permissions: [{ name: "VIEW_USERS" }]
   }
   ```

2. **Validate permissions on backend:**
   - Frontend checks are for UI only
   - Backend MUST validate permissions on every API call
   - Never trust frontend permission checks for security

3. **Use permission guards:**
   ```typescript
   @Post('users')
   @UseGuards(AuthGuard, PermissionsGuard)
   @RequirePermissions('CREATE_USER')
   async createUser() { ... }
   ```

---

## Testing Different Permission Scenarios

### Test as ADMIN (Full Access)
```json
{
  "role": {
    "permissions": [
      {"name": "VIEW_USERS"},
      {"name": "CREATE_USER"},
      {"name": "UPDATE_USER"},
      {"name": "DELETE_USER"},
      {"name": "TOGGLE_USER_STATUS"},
      {"name": "MANAGE_ROLES"}
    ]
  }
}
```
**Expected:** All buttons visible

### Test as MANAGER (View + Create Only)
```json
{
  "role": {
    "permissions": [
      {"name": "VIEW_USERS"},
      {"name": "CREATE_USER"}
    ]
  }
}
```
**Expected:** Only View and Create buttons visible

### Test as EMPLOYEE (Profile Only)
```json
{
  "role": {
    "permissions": [
      {"name": "VIEW_OWN_PROFILE"}
    ]
  }
}
```
**Expected:** Only see own profile, no user management

---

## Troubleshooting

### Buttons not showing up?

1. **Check user object in localStorage:**
   ```javascript
   console.log(JSON.parse(localStorage.getItem('currentUser')))
   ```

2. **Check if permissions are present:**
   ```javascript
   import { getUserPermissions } from '@/lib/permissions';
   console.log(getUserPermissions());
   ```

3. **Verify permission names match exactly:**
   - Case-sensitive: "DELETE_USER" ≠ "delete_user"
   - No spaces or typos

### All users see all buttons?

- Backend might not be sending permissions
- Check if user.role is object with permissions array
- Verify permissions are in localStorage currentUser

### No users see any buttons?

- Permission names might not match
- Check console for `getUserPermissions()` output
- Verify permission objects have "name" property

---

## Next Steps

1. **Update backend to send permissions** in JWT/user object
2. **Test with different roles** to verify correct behavior
3. **Add more permissions** as needed (search, export, etc.)
4. **Remove old role-based checks** if any remain
5. **Document backend permission list** to match frontend

---

## Summary

✅ **What was done:**
- Created permission helper functions in `src/lib/permissions.ts`
- Updated User type to support permissions
- Modified UserManagement to use permission checks
- Updated Dashboard to use permission checks
- Removed `isAdmin` prop entirely

✅ **How it works:**
- Backend sends user with role.permissions array
- Frontend extracts permission names
- Components check specific permissions before showing actions
- Same component adapts to different permission sets

✅ **Benefits:**
- Granular control over each action
- No code changes when permissions change
- Flexible role configurations
- Better security and maintainability
