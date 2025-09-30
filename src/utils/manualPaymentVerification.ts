import { supabase } from '@/integrations/supabase/client';

/**
 * Manually verify a payment reference by calling the verify-payment edge function
 * This is useful for backfilling missed transactions
 */
export const verifyPaymentManually = async (reference: string) => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser?.user) {
      throw new Error('User not authenticated');
    }

    // Call the verify-payment edge function
    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: { 
        reference,
        userId: currentUser.user.id
      }
    });

    if (error) {
      console.error('Payment verification error:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Manual payment verification failed:', error);
    throw error;
  }
};
