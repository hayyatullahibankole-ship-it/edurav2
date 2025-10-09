import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin, userRole, validateCurrentSession } = useAuth();
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const location = useLocation();

  // Check if user is on exam page - disable validation during exams
  const isOnExamPage = location.pathname === '/exam' || location.pathname.includes('/exam');

  // Validate session on mount and periodically (but not during exams)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkSession = async () => {
      if (user && !isOnExamPage) {
        const isValid = await validateCurrentSession();
        setSessionValid(isValid);
        if (!isValid) {
          // Navigation is handled in validateCurrentSession
          return;
        }
      }
    };

    if (user && !loading) {
      // Check session immediately (unless on exam page)
      if (!isOnExamPage) {
        checkSession();
        // Then check every 30 minutes (very infrequent to avoid interrupting long sessions)
        intervalId = setInterval(checkSession, 30 * 60 * 1000);
      } else {
        // During exam, mark session as valid without checking
        setSessionValid(true);
      }
    } else if (!user && !loading) {
      // If no user and not loading, mark session as invalid
      setSessionValid(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, loading, validateCurrentSession, isOnExamPage, location.pathname]);

  if (loading || (user && sessionValid === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If session is invalid, user will be redirected by validateCurrentSession
  if (!user || sessionValid === false) {
    return <Navigate to="/auth" replace />;
  }

  // For admin routes, wait until userRole is loaded
  if (requireAdmin) {
    if (userRole === null) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}