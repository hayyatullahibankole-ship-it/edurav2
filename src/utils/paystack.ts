import { z } from 'zod';

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

/**
 * Initialize Paystack payment
 */
export const initializePaystackPayment = (payment: PaystackPayment) => {
  try {
    // Validate input
    const validatedData = PaystackPaymentSchema.parse(payment);
    
    // Check if Paystack is loaded
    if (typeof window === 'undefined' || !window.PaystackPop) {
      throw new Error('Paystack SDK not loaded. Please include the Paystack script.');
    }
    
    const handler = window.PaystackPop.setup({
      key: 'pk_test_c4dcaa71b1a2dc1eef447b5b8d16144c334e7d02', // TODO: Move to system settings for security
      email: validatedData.email,
      amount: validatedData.amount * 100, // Convert to kobo
      currency: validatedData.currency,
      ref: validatedData.reference,
      metadata: validatedData.metadata,
      callback: function(response: any) {
        console.log('Payment successful:', response);
        // Handle successful payment
        window.location.href = `/payment-success?reference=${response.reference}`;
      },
      onClose: function() {
        console.log('Payment dialog closed');
        // Handle payment cancellation
      }
    });
    
    handler.openIframe();
  } catch (error) {
    console.error('Invalid payment data:', error);
    throw new Error('Failed to initialize payment');
  }
};

/**
 * Create subscription payment
 */
export const createSubscriptionPayment = (planType: string, userEmail: string, amount: number) => {
  const reference = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  initializePaystackPayment({
    amount,
    email: userEmail,
    reference,
    currency: "NGN",
    metadata: {
      plan_type: planType,
      subscription: true
    }
  });
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