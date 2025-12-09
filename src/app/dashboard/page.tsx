"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/auth";
import type { User } from "@/types/user";
import { UserManagement } from "@/components/admin/UserManagement";

type AdminStats = {
  managerCount: number;
  employeeCount: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user] = useState<User | null>(() => getCurrentUser());
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (!user) return;

    if (user.role === "ADMIN") {
      (async () => {
        try {
          const res = await fetch("/api/admin/stats");
          if (res.ok) {
            const data = (await res.json()) as AdminStats;
            setStats(data);
          }
        } catch {
          // ignore for now; could show toast
        }
      })();
    }
  }, [router, user]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome, {user.firstName} ({user.role})
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>

      {user.role === "ADMIN" && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Admin Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded border p-4">
              <h3 className="font-medium">Managers</h3>
              <p className="text-2xl font-bold">
                {stats ? stats.managerCount : "..."}
              </p>
            </div>
            <div className="rounded border p-4">
              <h3 className="font-medium">Employees</h3>
              <p className="text-2xl font-bold">
                {stats ? stats.employeeCount : "..."}
              </p>
            </div>
          </div>

          <UserManagement />
        </section>
      )}

      {user.role === "MANAGER" && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Manager Area</h2>
          <p className="text-gray-600">
            Managers can manage employees they are responsible for.
          </p>
        </section>
      )}

      {user.role === "EMPLOYEE" && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">My Profile</h2>
          <p className="text-gray-600">
            Employees can view and update only their own profile.
          </p>
        </section>
      )}
    </div>
  );
}

