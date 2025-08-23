import React, { useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { AuthContext, AuthContextType, SignInResult } from './authContextCore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se Supabase não está configurado, apenas finalizar loading e manter usuário nulo
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Erro ao obter sessão:', error);
      } finally {
        setLoading(false);
      }
    };
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<SignInResult> => {
    if (!isSupabaseConfigured || !supabase) {
      // Modo fallback: autenticação fictícia apenas para desenvolvimento
      const fakeUser = { id: 'dev-user', email } as unknown as User;
      setUser(fakeUser);
      setSession(null);
      return { data: { user: fakeUser, session: null }, error: null };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('Erro no login:', error);
        return { data: null, error };
      }
      return { data, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      // Limpa estado local (modo fallback)
      setUser(null);
      setSession(null);
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Erro no logout:', error);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Re-export do contexto para compatibilidade com imports existentes
export { AuthContext } from './authContextCore';
