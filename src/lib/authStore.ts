/* ═══════════════════════════════════════════
   AUTH STORE — Client-side only
   Uses localStorage for session persistence.
   ═══════════════════════════════════════════ */

const AUTH_KEY = "btm_admin_auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
  token: string;
}

const DEFAULT_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USER || "Amed",
  password: import.meta.env.VITE_ADMIN_PASS || "",
};

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeUser(user: AuthUser) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return !!getStoredUser();
}

export function login(username: string, password: string): AuthUser | null {
  const settingsRaw = localStorage.getItem("btm_settings");
  const settings = settingsRaw ? JSON.parse(settingsRaw) : {};

  const adminUsername = settings.adminUsername || DEFAULT_CREDENTIALS.username;
  const adminPassword = settings.adminPassword || DEFAULT_CREDENTIALS.password;

  if (username === adminUsername && password === adminPassword) {
    const user: AuthUser = {
      id: "admin-1",
      name: settings.adminName || "Amed",
      email: settings.adminEmail || "admin@besttravelmorocco.com",
      role: "admin",
      token: btoa(`${username}:${Date.now()}`),
    };
    storeUser(user);
    return user;
  }

  // Also check editor credentials
  const editorUsername = settings.editorUsername;
  const editorPassword = settings.editorPassword;
  if (editorUsername && editorPassword && username === editorUsername && password === editorPassword) {
    const user: AuthUser = {
      id: "editor-1",
      name: settings.editorName || "Editor",
      email: settings.editorEmail || "editor@besttravelmorocco.com",
      role: "editor",
      token: btoa(`${username}:${Date.now()}`),
    };
    storeUser(user);
    return user;
  }

  return null;
}

export function logout() {
  clearAuth();
  window.location.reload();
}

export function updateCurrentUser(updates: Partial<AuthUser>) {
  const user = getStoredUser();
  if (user) {
    const updated = { ...user, ...updates };
    storeUser(updated);
    return updated;
  }
  return null;
}
