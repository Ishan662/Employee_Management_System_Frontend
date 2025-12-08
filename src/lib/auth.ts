export async function login(email: string, password: string) {
  localStorage.setItem("token", "dummy-token");
}

export async function signup(payload: any) {
  console.log("Signup payload:", payload);
}

export function logout() {
  localStorage.removeItem("token");
}
