import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { logout as doSignOut } from "@/lib/authStore";
import type { User } from "@supabase/supabase-js";

// Shape the layouts consume
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    name: (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "Admin",
    email: user.email ?? "",
    role: "admin",
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? toAuthUser(data.user) : null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? toAuthUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = useCallback(() => {
    doSignOut();
  }, []);

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading: user === undefined,
    isAdmin: true,
    isEditor: false,
    logout,
  };
}
