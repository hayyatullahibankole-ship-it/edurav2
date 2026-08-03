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

// Function to get Paystack public key from database (env-aware)
const getPaystackPublicKey = async (): Promise<string> => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isStaging = hostname.includes('lovableproject.com') || hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const keyName = isStaging ? 'paystack_public_key_test' : 'paystack_public_key';

  // Try environment-specific key first
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', keyName)
    .eq('is_public', true)
    .maybeSingle();

  if (data?.value) return data.value as string;

  // Fallbacks
  if (isStaging) {
    // If test key missing, fallback to live so flow can continue, but warn
    const { data: live } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'paystack_public_key')
      .eq('is_public', true)
      .maybeSingle();
    if (live?.value) {
      console.warn('[Paystack] Using LIVE key on staging. Add system_settings key "paystack_public_key_test" for safer testing.');
      return live.value as string;
    }
  }

  throw new Error('Paystack key not configured. Please set system_settings "paystack_public_key" (and optional "paystack_public_key_test" for staging).');
};

/**
 * Load the Paystack inline SDK on demand (once per page).
 */
let paystackLoader: Promise<void> | null = null;
export const ensurePaystackLoaded = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Paystack unavailable'));
  if (window.PaystackPop) return Promise.resolve();
  if (paystackLoader) return paystackLoader;

  paystackLoader = new Promise<void>((resolve, reject) => {
    const src = 'https://js.paystack.co/v1/inline.js';
    let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => {
      paystackLoader = null;
      reject(new Error('Could not load the payment window. Check your connection and try again.'));
    });
    // Already loaded before listener attached
    if (window.PaystackPop) resolve();
  });

  return paystackLoader;
};

/**
 * Initialize Paystack payment
 */
export const initializePaystackPayment = async (
  payment: PaystackPayment,
  onSuccess?: (reference: string) => void,
  onClose?: () => void
) => {
  try {
    // Validate input
    const validatedData = PaystackPaymentSchema.parse(payment);

    // Make sure the Paystack SDK is available
    await ensurePaystackLoaded();
    if (!window.PaystackPop) {
      throw new Error('Payment window could not be opened. Please try again.');
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
        // Use callback instead of window.location for SPA navigation
        if (onSuccess) {
          onSuccess(response.reference);
        } else {
          // Fallback: use pushState instead of full reload
          window.history.pushState({}, '', `/payment-success?reference=${response.reference}`);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      },
      onClose: function() {
        onClose?.();
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
export const createSubscriptionPayment = async (
  planType: string, 
  userEmail: string, 
  amount: number,
  metadata?: {
    student_seats?: number;
    price_per_student?: number;
    school_id?: string;
    admin_auth_id?: string;
  },
  onSuccess?: (reference: string) => void
) => {
  // Initialize Paystack payment
  const reference = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    await initializePaystackPayment({
      amount: amount * 100, // Convert naira to kobo
      email: userEmail,
      reference,
      currency: "NGN",
      metadata: {
        plan_type: planType,
        subscription: true,
        ...metadata
      }
    }, onSuccess);
    
    return reference;
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