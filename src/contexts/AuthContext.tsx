import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Teacher } from '../types/supabase';

interface AuthContextType {
  user: User | null;
  teacher: Teacher | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTeacher = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setTeacher(data);
      }
    } catch (err) {
      console.error('Error loading teacher:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Проверяем текущую сессию
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }

        const session = sessionData?.session;
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadTeacher(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Слушаем изменения аутентификации
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadTeacher(session.user.id);
      } else {
        setTeacher(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [loadTeacher]);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        // Создаём запись в таблице teachers
        const { error: insertError } = await supabase
          .from('teachers')
          .insert([{ id: data.user.id, email, name }]);

        if (insertError) return { error: insertError };
      }

      return { error: null };
    } catch (err) {
      console.error('Sign up error:', err);
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setTeacher(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const value: AuthContextType = {
    user,
    teacher,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  // Возвращаем безопасные дефолтные значения если контекст не доступен
  if (context === null) {
    console.warn('useAuth called outside of AuthProvider, returning default values');
    return {
      user: null,
      teacher: null,
      loading: false,
      signUp: async () => ({ error: { message: 'AuthProvider not initialized' } }),
      signIn: async () => ({ error: { message: 'AuthProvider not initialized' } }),
      signOut: async () => {},
    };
  }
  
  return context;
}
