import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { getStoredUser, isAuthenticated, logout, type AuthUser } from "@/lib/authStore";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } = options ?? {};
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  // Re-read auth state from localStorage
  const user = useMemo<AuthUser | null>(() => getStoredUser(), [checked]);
  const authenticated = useMemo(() => isAuthenticated(), [checked]);

  const doLogout = useCallback(() => {
    logout();
  }, []);

  useEffect(() => {
    setChecked(true);
    if (redirectOnUnauthenticated && !isAuthenticated()) {
      navigate(redirectPath);
    }
  }, [redirectOnUnauthenticated, redirectPath, navigate]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: authenticated,
      isLoading: false,
      isAdmin: user?.role === "admin",
      isEditor: user?.role === "editor",
      logout: doLogout,
      refresh: () => setChecked(c => c + 1),
    }),
    [user, authenticated, doLogout, checked],
  );
}
