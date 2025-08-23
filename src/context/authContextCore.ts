import { createContext } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface SignInResult {
  data: { user: User | null; session: Session | null } | null;
  error: AuthError | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
