"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/auth";
import { usePermissions } from "@/lib/permissions";
import type { User } from "@/types/user";
import {UserManagement} from "@/components/admin/UserManagement";
import EmployeeProfile from "@/components/employee/EmployeeProfile";

type AdminStats = {
  totalUsers: number;
  managers: number;
  employees: number;
};

// Helper function to get role name from user object
const getRoleName = (user: User | null): string => {
  if (!user) return "";
  if (typeof user.role === "string") return user.role.toUpperCase();
  if (typeof user.role === "object" && user.role.name) return user.role.name.toUpperCase();
  return "";
};

export default function DashboardPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeView, setActiveView] = useState<
    "overview" | "managers" | "employees"
  >("overview");

  useEffect(() => {
    const current = getCurrentUser();
    if (current) {
      setUser(current);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!user || getRoleName(user) !== "ADMIN") return;

    (async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        const res = await fetch("/api/users/admin/stats", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = (await res.json()) as AdminStats;
          console.log("Stats loaded:", data);
          setStats(data);
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error("Failed to fetch stats:", res.status, errorData);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    })();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Dashboard
              </h1>
              <p className="mt-2 text-blue-100">
                Welcome back, <span className="font-semibold text-white">{user.firstName}</span>
                <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {getRoleName(user)}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              {hasPermission("MANAGE_ROLES") && (
                <button
                  onClick={() => router.push("/roles")}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105"
                >
                  Manage Roles
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {getRoleName(user) === "ADMIN" && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">Admin Overview</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-purple-100 uppercase tracking-wide">Total Users</p>
                  </div>
                  <p className="text-5xl font-bold text-white mb-2">
                    {stats ? stats.totalUsers : "..."}
                  </p>
                  <p className="text-purple-100 text-sm">All registered users</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveView("managers")}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-xl text-left cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Managers</p>
                  </div>
                  <p className="text-5xl font-bold text-white mb-2">
                    {stats ? stats.managers : "..."}
                  </p>
                  <p className="text-blue-100 text-sm flex items-center gap-2">
                    Click to manage
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveView("employees")}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 shadow-xl text-left cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-emerald-100 uppercase tracking-wide">Employees</p>
                  </div>
                  <p className="text-5xl font-bold text-white mb-2">
                    {stats ? stats.employees : "..."}
                  </p>
                  <p className="text-emerald-100 text-sm flex items-center gap-2">
                    Click to manage
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push("/roles")}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 shadow-xl text-left cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-orange-100 uppercase tracking-wide">Roles & Permissions</p>
                    
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    Manage Access
                  </p>
                  <p className="text-orange-100 text-sm flex items-center gap-2">
                    Configure permissions
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </p>
                </div>
              </button>
            </div>

          {activeView === "managers" && (
            <UserManagement title="Managers" roleFilter="MANAGER" />
          )}

          {activeView === "employees" && (
            <UserManagement title="Employees" roleFilter="EMPLOYEE" />
          )}
        </section>
      )}

      {getRoleName(user) === "MANAGER" && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">Manager Dashboard</h2>
          </div>
          
          <UserManagement title="Employees" roleFilter="EMPLOYEE" />
        </section>
      )}

      {getRoleName(user) === "EMPLOYEE" && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
          </div>
          
          <EmployeeProfile />
        </section>
      )}
      </div>
    </div>
  );
}

