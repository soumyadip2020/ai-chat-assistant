import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  businessName: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, businessName: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ai-receptionist-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const u = { id: '1', email, businessName: 'My Business' };
    setUser(u);
    localStorage.setItem('ai-receptionist-user', JSON.stringify(u));
    setIsLoading(false);
    return true;
  };

  const signup = async (email: string, _password: string, businessName: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const u = { id: '1', email, businessName };
    setUser(u);
    localStorage.setItem('ai-receptionist-user', JSON.stringify(u));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ai-receptionist-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
