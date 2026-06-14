import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRole, type AdminRole } from '@/context/RoleContext';

interface Props {
  allow: AdminRole[];
  children: ReactNode;
}

export default function RoleGuard({ allow, children }: Props) {
  const { role, loading } = useRole();
  if (loading) return null;
  if (!role || !allow.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
