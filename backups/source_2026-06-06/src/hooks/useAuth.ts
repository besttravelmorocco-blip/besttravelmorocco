import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { log } from '@/lib/logger';
import type { User } from '@supabase/supabase-js';

// Auto-logout after 8 hours of inactivity
const INACTIVITY_MS = 8 * 60 * 60 * 1000;

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset the inactivity timer on any user interaction
  function resetTimer() {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      log.warn('auth', 'Session expired due to inactivity — signing out');
      supabase.auth.signOut();
    }, INACTIVITY_MS);
  }

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) log.error('auth', 'getSession failed', error.message);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session?.user) {
        log.info('auth', `Session restored for ${data.session.user.email}`);
        resetTimer();
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        log.success('auth', `Signed in: ${session?.user?.email}`);
        resetTimer();
      } else if (event === 'SIGNED_OUT') {
        log.info('auth', 'Signed out');
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      } else if (event === 'TOKEN_REFRESHED') {
        log.info('auth', 'Session token refreshed');
        resetTimer();
      }
    });

    // Track activity to reset inactivity timer
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));

    return () => {
      subscription.unsubscribe();
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    log.info('auth', `Login attempt: ${email}`);
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      log.error('auth', `Login failed: ${email}`, result.error.message);
    }
    return result;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signIn, signOut };
}
