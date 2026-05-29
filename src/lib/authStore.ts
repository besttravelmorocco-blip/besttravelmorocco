/* ═══════════════════════════════════════════
   AUTH STORE — Supabase Auth
   ═══════════════════════════════════════════ */

import { supabase } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

export type { User };

export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(
  callback: (session: Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange((_, session) => {
    callback(session);
  });
  return data.subscription;
}
