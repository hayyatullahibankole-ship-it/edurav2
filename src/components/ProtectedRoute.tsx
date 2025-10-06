import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin, userRole, validateCurrentSession } = useAuth();
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  // Validate session on mount and periodically
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkSession = async () => {
      if (user) {
        const isValid = await validateCurrentSession();
        setSessionValid(isValid);
      }
    };

    if (user && !loading) {
      // Check session immediately
      checkSession();
      
      // Then check every 30 seconds
      intervalId = setInterval(checkSession, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, loading, validateCurrentSession]);

  if (loading || sessionValid === null) {
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