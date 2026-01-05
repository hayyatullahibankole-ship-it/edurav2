import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface FreeAccessData {
  hasFreeAccess: boolean;
  expiryDate: string | null;
  isExpired: boolean;
  daysRemaining: number;
}

export function useFreeAccess() {
  const [data, setData] = useState<FreeAccessData>({
    hasFreeAccess: false,
    expiryDate: null,
    isExpired: false,
    daysRemaining: 0
  });
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  const refresh = async () => {
    if (!userProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('free_practice_access, free_access_expiry_date')
        .eq('id', userProfile.id)
        .single();

      if (error) {
        console.error('Error fetching free access:', error);
        setLoading(false);
        return;
      }

      if (userData) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const expiryDate = userData.free_access_expiry_date 
          ? new Date(userData.free_access_expiry_date) 
          : null;
        
        const isExpired = expiryDate ? expiryDate < today : false;
        const daysRemaining = expiryDate 
          ? Math.max(0, Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        setData({
          hasFreeAccess: userData.free_practice_access === true,
          expiryDate: userData.free_access_expiry_date,
          isExpired,
          daysRemaining
        });
      }
    } catch (err) {
      console.error('Free access check error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [userProfile?.id]);

  // User has valid free access (not expired)
  const hasValidFreeAccess = data.hasFreeAccess && !data.isExpired && data.expiryDate !== null;

  return {
    ...data,
    hasValidFreeAccess,
    loading,
    refresh
  };
}
