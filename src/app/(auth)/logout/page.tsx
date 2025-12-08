"use client";

import { useEffect } from "react";
import { logout } from "@/lib/auth";

export default function LogoutPage() {
  useEffect(() => {
    logout();
    window.location.href = "/login";
  }, []);

  return <div>Logging out...</div>;
}
