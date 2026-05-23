import { createContext, useContext, useState, ReactNode } from 'react';

interface MockUser {
  id: string;
  email: string;
  user_metadata: { full_name: string };
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const MOCK_USER: MockUser = {
  id: 'mock-user-123',
  email: 'demo@medistock.com',
  user_metadata: { full_name: 'Demo User' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(MOCK_USER);
  const [loading] = useState(false);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Mock signup - auto sign in
    setUser({
      id: 'new-user-' + Date.now(),
      email,
      user_metadata: { full_name: fullName },
    });
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Mock signin - always succeeds
    setUser(MOCK_USER);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
