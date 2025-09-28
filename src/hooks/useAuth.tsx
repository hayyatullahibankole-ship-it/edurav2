import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  userRole: string | null;
  isAdmin: boolean;
  userProfile: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile and role using setTimeout to avoid blocking
          setTimeout(async () => {
            try {
              setLoading(true);
              
              // First get the user profile
              const profileResponse = await supabase
                .from('users')
                .select('*')
                .eq('auth_user_id', session.user.id)
                .single();

              if (profileResponse.data) {
                setUserProfile(profileResponse.data);
                
                // Then get the user role using the profile ID
                const roleResponse = await supabase
                  .from('user_roles')
                  .select('role')
                  .eq('user_id', profileResponse.data.id)
                  .single();
                  
                if (roleResponse.data) {
                  setUserRole(roleResponse.data.role);
                }
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setUserProfile(null);
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Clear all local state first
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setUserRole(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error during signOut:', error);
      // Even if there's an error, clear local state
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setUserRole(null);
    }
  };

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  const value = {
    user,
    session,
    loading,
    signOut,
    userRole,
    isAdmin,
    userProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}