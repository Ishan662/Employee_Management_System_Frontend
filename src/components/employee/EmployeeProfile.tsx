"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types/user";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      console.log("Token exists:", !!token);
      console.log("Token value:", token?.substring(0, 20) + "...");
      
      if (!token) {
        console.error("No access token found");
        return;
      }
      
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Profile loaded:", data);
        setProfile(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to fetch profile:", res.status, errorData);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (user: any): string => {
    if (!user?.role) return "";
    if (typeof user.role === "string") return user.role;
    if (typeof user.role === "object" && user.role.name) return user.role.name;
    return "";
  };

  const getPermissions = (user: any): string[] => {
    if (!user) return [];
    
    if (Array.isArray(user.permissions)) {
      return user.permissions.map((p: any) =>
        typeof p === "string" ? p : p.name || ""
      ).filter(Boolean);
    }
    
    if (user.role && Array.isArray(user.role.permissions)) {
      return user.role.permissions
        .map((p: any) => (typeof p === "string" ? p : p.name || ""))
        .filter(Boolean);
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-500">Unable to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
              <span className="text-5xl font-bold text-white">
                {profile.firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">
                {profile.firstName} {profile.lastName || ""}
              </h2>
              <p className="text-blue-100 text-lg">{profile.email}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-white/30">
                  {getRoleName(profile)}
                </span>
                {profile.isActive !== undefined && (
                  <span
                    className={`px-4 py-1.5 backdrop-blur-sm rounded-full text-sm font-medium border ${
                      profile.isActive
                        ? "bg-green-500/20 text-green-100 border-green-300/30"
                        : "bg-gray-500/20 text-gray-100 border-gray-300/30"
                    }`}
                  >
                    {profile.isActive ? "Active" : "Inactive"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">First Name</label>
              <p className="mt-1 text-lg text-gray-900">{profile.firstName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Name</label>
              <p className="mt-1 text-lg text-gray-900">{profile.lastName || "Not provided"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <p className="mt-1 text-lg text-gray-900">{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Role & Permissions
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <div className="mt-2">
                <span className="inline-flex px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  {getRoleName(profile)}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">Permissions</label>
              {getPermissions(profile).length === 0 ? (
                <p className="text-sm text-gray-400 italic">No permissions assigned</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {getPermissions(profile).map((perm, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Account Status</label>
              <div className="mt-2">
                <span
                  className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${
                    profile.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {profile.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>
  );
}
