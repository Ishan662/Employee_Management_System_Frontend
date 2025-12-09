import type { User } from "@/types/user";

type SignupPayload = {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
};

type AuthResponse = {
  accessToken?: string; // camelCase variant
  access_token?: string; // snake_case variant from NestJS
  user: User;
};

export async function login(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || "Login failed");
  }

  const data = (await res.json()) as AuthResponse;
  const token = data.accessToken ?? data.access_token;
  if (token) {
    localStorage.setItem("accessToken", token);
  }
  if (data?.user) {
    localStorage.setItem("currentUser", JSON.stringify(data.user));
  }
  return data;
}

export async function signup(payload: SignupPayload) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || "Signup failed");
  }

  const data = (await res.json()) as AuthResponse;
  const token = data.accessToken ?? data.access_token;
  if (token) {
    localStorage.setItem("accessToken", token);
  }
  if (data?.user) {
    localStorage.setItem("currentUser", JSON.stringify(data.user));
  }
  return data;
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("currentUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("currentUser");
}

