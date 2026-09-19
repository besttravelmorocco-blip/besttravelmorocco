import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type AdminRole =
  | 'super_admin'
  | 'website_manager'
  | 'operations_manager'
  | 'sales_agent'
  | 'content_editor'
  | 'finance_manager';

interface RoleCtx {
  role: AdminRole | null;
  loading: boolean;
  hasAccess: (allowed: AdminRole[]) => boolean;
  refetch: () => void;
}

const Ctx = createContext<RoleCtx>({
  role: null,
  loading: true,
  hasAccess: () => false,
  refetch: () => {},
});

export function useRole() {
  return useContext(Ctx);
}

export function RoleProvider({
  user,
  children,
}: {
  user: { email?: string | null };
  children: ReactNode;
}) {
  const [role, setRole]     = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchRole() {
    if (!user.email) {
      console.warn('[RoleContext] no email on user object — skipping role fetch');
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Ensure Supabase client has the JWT in its internal state before querying
    await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('admin_user_roles')
      .select('role')
      .eq('email', user.email)
      .maybeSingle();
    console.log('[RoleContext] email=%s  data=%o  error=%o', user.email, data, error);
    setRole((data?.role as AdminRole) ?? null);
    setLoading(false);
  }

  useEffect(() => { fetchRole(); }, [user.email]);

  function hasAccess(allowed: AdminRole[]) {
    if (!role) return false;
    return allowed.includes(role);
  }

  return (
    <Ctx.Provider value={{ role, loading, hasAccess, refetch: fetchRole }}>
      {children}
    </Ctx.Provider>
  );
}
