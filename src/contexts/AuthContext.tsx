import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Profile } from '../types';
import { useAppData } from './AppDataContext';

const AUTH_KEY = 'tuition-auth-v1';

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string, role: 'admin' | 'student') => Promise<void>;
  signOut: () => Promise<void>;
}

function loadSession(): { user: AuthUser; profile: Profile } | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user: AuthUser; profile: Profile };
    if (parsed?.user?.id && parsed?.profile?.role) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function saveSession(user: AuthUser, profile: Profile) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, profile }));
}

function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

function slugEmail(email: string) {
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'user';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getStudents } = useAppData();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = loadSession();
    if (session) {
      setUser(session.user);
      setProfile(session.profile);
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string, role: 'admin' | 'student') => {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      if (!trimmedEmail || !trimmedPassword) {
        throw new Error('Email and password are required');
      }

      const t = new Date().toISOString();
      const fromLocal = trimmedEmail.split('@')[0]?.replace(/[._-]/g, ' ') || 'User';
      const full_name = fromLocal.replace(/\b\w/g, (c) => c.toUpperCase());

      if (role === 'admin') {
        const id = `admin-${slugEmail(trimmedEmail)}`;
        const authUser: AuthUser = { id, email: trimmedEmail.toLowerCase() };
        const prof: Profile = {
          id,
          email: authUser.email,
          role: 'admin',
          full_name,
          created_at: t,
          updated_at: t,
        };
        saveSession(authUser, prof);
        setUser(authUser);
        setProfile(prof);
        return;
      }

      const students = getStudents();
      const match = students.find(
        (s) => s.profiles?.email?.toLowerCase() === trimmedEmail.toLowerCase()
      );
      const id = match?.id ?? `student-${slugEmail(trimmedEmail)}`;
      const authUser: AuthUser = { id, email: trimmedEmail.toLowerCase() };
      const prof: Profile = {
        id,
        email: authUser.email,
        role: 'student',
        full_name: match?.profiles?.full_name ?? full_name,
        created_at: t,
        updated_at: t,
      };
      saveSession(authUser, prof);
      setUser(authUser);
      setProfile(prof);
    },
    [getStudents]
  );

  const signOut = useCallback(async () => {
    clearSession();
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
