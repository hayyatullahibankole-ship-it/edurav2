import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  validateSessionToken, 
  getSessionToken, 
  clearSessionToken, 
  clearSessionTokenInDB,
  setSessionToken,
  generateSessionToken,
  storeSessionToken
} from '@/utils/sessionManager';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  userRole: string | null;
  isAdmin: boolean;
  userProfile: any;
  validateCurrentSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  // Validate current session token
  const validateCurrentSession = async (): Promise<boolean> => {
    if (!user) return false;
    
    // If offline, skip validation and trust cached session
    if (!navigator.onLine) {
      console.log('Offline mode - skipping session validation');
      return true;
    }
    
    const localToken = getSessionToken();
    if (!localToken) {
      console.warn('No local session token found');
      await signOut();
      return false;
    }

    try {
      const isValid = await validateSessionToken(user.id, localToken);
      
      if (!isValid) {
        console.warn('Session token invalid - logging out');
        toast({
          title: "Session Expired",
          description: "You've been logged out because your account was accessed from another device.",
          variant: "destructive",
        });
        await signOut();
        return false;
      }

      return true;
    } catch (error) {
      // If validation fails due to network error, assume session is valid offline
      console.warn('Session validation failed, checking if offline:', error);
      if (!navigator.onLine) {
        return true;
      }
      // If online but validation failed for other reasons, log out
      await signOut();
      return false;
    }
  };

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
            // Ensure a session token exists on hard refreshes
            const existing = getSessionToken();
            if (!existing) {
              const newToken = generateSessionToken();
              storeSessionToken(newToken);
              await setSessionToken(session.user.id, newToken);
            }
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
        
        // Determine role via secure RPC to avoid RLS issues
        const { data: isAdminFlag, error: roleError } = await supabase
          .rpc('is_admin', { _user_id: userId });

        if (!roleError && typeof isAdminFlag === 'boolean') {
          setUserRole(isAdminFlag ? 'admin' : 'student');
        } else {
          console.warn('Role fetch error (RPC), defaulting to student:', roleError);
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
      async (event, session) => {
        if (!isMounted) return;

        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Initialize session token on sign in, token refresh, or initial session (on hard refresh)
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            const existing = getSessionToken();
            if (!existing) {
              const { generateSessionToken, storeSessionToken, setSessionToken } = await import('@/utils/sessionManager');
              const newToken = generateSessionToken();
              storeSessionToken(newToken);
              await setSessionToken(session.user.id, newToken);
            }
          }
          
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
      const currentUser = user;
      const currentSession = session;
      
      // Clear session token from database first
      if (currentUser) {
        try {
          await clearSessionTokenInDB(currentUser.id);
        } catch (dbError) {
          console.error('Error clearing session token from DB:', dbError);
          // Continue with logout even if DB clear fails
        }
      }
      
      // Clear local session token
      clearSessionToken();
      
      // Clear all local state first
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setUserRole(null);
      
      // Only attempt Supabase signout if we actually have a session
      if (currentSession) {
        const { error } = await supabase.auth.signOut();
        
        // Ignore "Auth session missing" error as it's expected during logout
        if (error && error.message !== 'Auth session missing!') {
          console.error('Error signing out:', error);
        }
      }
    } catch (error) {
      console.error('Error during signOut:', error);
      // Even if there's an error, ensure local state is cleared
      clearSessionToken();
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
    userProfile,
    validateCurrentSession
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