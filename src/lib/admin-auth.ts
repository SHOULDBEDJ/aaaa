const KEY = "pmds_admin_auth";
const CRED = "PMDS";

export function login(username: string, password: string): boolean {
  if (username === CRED && password === CRED) {
    if (typeof window !== "undefined") sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}

export function logout() {
  if (typeof window !== "undefined") sessionStorage.removeItem(KEY);
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(KEY) === "1";
}
