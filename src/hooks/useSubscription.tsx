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
    const fetchSubscription = async () => {
      if (!user || !userProfile) {
        setLoading(false);
        return;
      }

      try {
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
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, userProfile]);

  // User has access if they have any active subscription (free or premium)
  const hasPremiumAccess = !loading && subscription && subscription.status === 'ACTIVE';
  
  // User is premium only if they have a paid subscription with premium access level
  const isPremium = hasPremiumAccess && 
    subscription?.subscription_plans?.resource_access_level === 'premium' &&
    subscription?.subscription_plans?.price > 0;
  
  // User is on free plan if they have basic access level or price = 0
  const isFree = hasPremiumAccess && 
    (subscription?.subscription_plans?.resource_access_level === 'basic' || 
     subscription?.subscription_plans?.price === 0);

  return {
    subscription,
    loading,
    hasPremiumAccess: !!hasPremiumAccess,
    isPremium: !!isPremium,
    isFree: !!isFree,
  };
}