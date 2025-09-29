import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SubscriptionData {
  id: string;
  status: string;
  plan_id: string;
  start_date: string;
  end_date: string | null;
  subscription_plans?: {
    name: string;
    price: number;
    resource_access_level: string;
    features?: any;
  };
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchSubscription = async () => {
      if (!user) {
        // No user authenticated, stop loading
        setSubscription(null);
        setLoading(false);
        return;
      }

      if (!userProfile) {
        // Wait until auth and profile are ready, but with timeout
        setLoading(true);
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          console.warn('Subscription loading timeout - proceeding with basic access');
          setSubscription(null);
          setLoading(false);
        }, 10000); // 10 second timeout
        
        return;
      }

      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      try {
        console.log('Fetching subscription for user profile:', userProfile.id);
        
        // Get the user's active subscription (including free accounts)
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            *,
            subscription_plans (
              name,
              price,
              resource_access_level,
              features
            )
          `)
          .eq('user_id', userProfile.id)
          .eq('status', 'ACTIVE')
          .gte('end_date', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
          // If error, assume basic access to prevent blocking
          setSubscription(null);
        } else {
          console.log('Subscription data fetched:', data);
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        // On error, assume basic access
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, userProfile]);

  // Normalize subscription state
  const active = subscription?.status === 'ACTIVE';
  const notExpired = subscription?.end_date ? new Date(subscription.end_date) > new Date() : true;
  const accessLevel = subscription?.subscription_plans?.resource_access_level?.toLowerCase();

  // User has any active (non-expired) subscription OR no subscription (default basic access)
  const hasActiveSubscription = Boolean(!loading && active && notExpired);
  
  // User is on basic/free plan (either explicitly or as default)
  const isFree = Boolean(!loading && (hasActiveSubscription && accessLevel === 'basic'));
  
  // User has basic access (either via free subscription or as default when not loading)
  const hasBasicAccess = Boolean(!loading && (hasActiveSubscription || !subscription));
  
  // User is premium if access level is premium or enterprise
  const isPremium = Boolean(hasActiveSubscription && (accessLevel === 'premium' || (subscription?.subscription_plans?.name || '').toLowerCase().includes('premium')));
  
  // User is enterprise if access level is enterprise
  const isEnterprise = Boolean(hasActiveSubscription && (accessLevel === 'enterprise' || (subscription?.subscription_plans?.name || '').toLowerCase().includes('enterprise')));
  
  // User can access premium content (premium or enterprise)
  const canAccessPremium = Boolean(isPremium || isEnterprise);
  
  // User has premium access (premium or enterprise subscriptions)
  const hasPremiumAccess = Boolean(isPremium || isEnterprise);
  if (typeof window !== 'undefined') {
    console.debug('useSubscription', {
      userId: user?.id,
      profileId: userProfile?.id,
      subscription,
      accessLevel,
      active,
      notExpired,
      isPremium: Boolean(isPremium),
      loading
    });
  }

  return {
    subscription,
    loading,
    hasBasicAccess: !!hasBasicAccess,
    hasPremiumAccess: !!hasPremiumAccess,
    isPremium: !!isPremium,
    isEnterprise: !!isEnterprise,
    canAccessPremium: !!canAccessPremium,
    isFree: !!isFree,
  };
}