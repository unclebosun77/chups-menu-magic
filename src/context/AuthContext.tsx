import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'consumer' | 'restaurant' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userRole: UserRole;
  restaurantId: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const resolveRole = async (u: User | null) => {
    if (!u) {
      setUserRole(null);
      setRestaurantId(null);
      return;
    }
    const role = u.user_metadata?.role;
    if (role === 'restaurant') {
      const { data } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', u.id)
        .maybeSingle();
      if (data) {
        setUserRole('restaurant');
        setRestaurantId(data.id);
      } else {
        setUserRole('consumer');
        setRestaurantId(null);
      }
    } else {
      setUserRole('consumer');
      setRestaurantId(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        await resolveRole(session?.user ?? null);
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      await resolveRole(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setRestaurantId(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, userRole, restaurantId, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
