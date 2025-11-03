import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authAPI, type Admin } from '../lib/api';

type AuthContextType = {
  admin: Admin | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const admin = await authAPI.getProfile();
          setAdmin(admin);
        } catch (error) {
          try {
            const refreshResponse = await authAPI.refreshToken();
            localStorage.setItem('authToken', refreshResponse.accessToken);
            setAdmin(refreshResponse.user);
          } catch (refreshError) {
            localStorage.removeItem('authToken');
            setAdmin(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { admin, token } = await authAPI.signIn(email, password);
    localStorage.setItem('authToken', token);
    setAdmin(admin);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { admin, token } = await authAPI.signUp(name, email, password);
    localStorage.setItem('authToken', token);
    setAdmin(admin);
  };

  const signOut = async () => {
    await authAPI.signOut();
    localStorage.removeItem('authToken');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, signIn, signUp, signOut }}>
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
