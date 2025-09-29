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
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserData(session.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

  const fetchUserData = async (userId: string) => {
    try {
      // Set a timeout to prevent indefinite loading
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('User data fetch timed out, setting defaults');
          setUserProfile(null);
          setUserRole('student');
          setLoading(false);
        }
      }, 5000); // 5 second timeout

      // Get user profile with retry logic
      let profileData = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && !profileData && isMounted) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', userId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Profile fetch error:', error);
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        } else {
          profileData = data;
          break;
        }
      }

      clearTimeout(timeoutId);

      if (!isMounted) return;

      if (profileData) {
        setUserProfile(profileData);
        
        // Get user role from user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profileData.id)
          .maybeSingle();
          
        if (!roleError && roleData) {
          setUserRole(roleData.role);
        } else {
          console.warn('Role fetch error, defaulting to student:', roleError);
          setUserRole('student');
        }
      } else {
        // No profile found - this should be rare after our migration
        console.warn('No user profile found for authenticated user:', userId);
        setUserProfile(null);
        setUserRole('student');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (isMounted) {
        setUserProfile(null);
        setUserRole('student');
        setLoading(false);
      }
    }
  };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setLoading(true);
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
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