import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGetMe, getGetMeQueryKey, User } from '@workspace/api-client-react';
import { useLanguage } from '@/lib/language';
import type { Lang } from '@/lib/language';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('esaal_token'));
  const { setLang } = useLanguage();

  const { data: user, isLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false
    }
  });

  useEffect(() => {
    if (error && (error as any).status === 401) {
      console.log("[AUTH] Session invalidated, logging out...");
      logout();
    }
  }, [error]);

  useEffect(() => {
    if (user?.preferredLang) {
      setLang(user.preferredLang as Lang);
    }
  }, [user?.preferredLang]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('esaal_token', newToken);
    setToken(newToken);
    if (newUser.preferredLang) {
      setLang(newUser.preferredLang as Lang);
    }
  };

  const logout = () => {
    localStorage.removeItem('esaal_token');
    setToken(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user: user || null, token, isLoading, login, logout }}>
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
