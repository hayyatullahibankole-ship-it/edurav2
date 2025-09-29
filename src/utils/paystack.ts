import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

// Paystack payment schema for validation
const PaystackPaymentSchema = z.object({
  amount: z.number().min(100, "Amount must be at least 100 kobo (₦1)"),
  email: z.string().email("Invalid email address"),
  reference: z.string().min(1, "Reference is required"),
  currency: z.string().default("NGN"),
  plan: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export type PaystackPayment = z.infer<typeof PaystackPaymentSchema>;

// Function to get Paystack public key from database
const getPaystackPublicKey = async (): Promise<string> => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'paystack_public_key')
    .eq('is_public', true)
    .single();
    
  if (error || !data) {
    throw new Error('Payment system configuration error. Please contact support.');
  }
  
  return data.value;
};

/**
 * Initialize Paystack payment
 */
export const initializePaystackPayment = async (payment: PaystackPayment) => {
  try {
    // Validate input
    const validatedData = PaystackPaymentSchema.parse(payment);
    
    // Check if Paystack is loaded
    if (typeof window === 'undefined' || !window.PaystackPop) {
      throw new Error('Paystack SDK not loaded. Please include the Paystack script.');
    }
    
    // Get the public key from database
    const publicKey = await getPaystackPublicKey();
    
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: validatedData.email,
      amount: validatedData.amount, // Amount should already be in kobo
      currency: validatedData.currency,
      ref: validatedData.reference,
      metadata: validatedData.metadata,
      callback: function(response: any) {
        window.location.href = `/payment-success?reference=${response.reference}`;
      },
      onClose: function() {
        // User closed payment dialog
      }
    });
    
    handler.openIframe();
  } catch (error) {
    console.error('Payment initialization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Payment initialization failed: ${errorMessage}`);
  }
};

/**
 * Create subscription payment
 */
export const createSubscriptionPayment = async (planType: string, userEmail: string, amount: number) => {
  const reference = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    await initializePaystackPayment({
      amount: amount * 100, // Convert naira to kobo
      email: userEmail,
      reference,
      currency: "NGN",
      metadata: {
        plan_type: planType,
        subscription: true
      }
    });
  } catch (error) {
    console.error('Payment initialization failed:', error);
    throw error;
  }
};

// Declare Paystack types for TypeScript
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => {
        openIframe: () => void;
      };
    };
  }
}