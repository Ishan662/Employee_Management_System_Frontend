type SignupPayload = {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
};

export async function login(email: string, password: string) {
  // Call Next.js API route (proxy to backend)
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || "Login failed");
  }

  const data = await res.json();
  if (data?.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

export async function signup(payload: SignupPayload) {
  // Call Next.js API route (proxy to backend)
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || "Signup failed");
  }

  const data = await res.json();
  if (data?.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

export function logout() {
  localStorage.removeItem("token");
}
