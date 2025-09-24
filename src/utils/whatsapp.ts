import { z } from 'zod';

// WhatsApp message schema for validation
const WhatsAppMessageSchema = z.object({
  phone: z.string().regex(/^\+234\d{10}$/, "Invalid Nigerian phone number format (+234xxxxxxxxxx)"),
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long")
});

export type WhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;

/**
 * Opens WhatsApp with pre-filled message
 */
export const sendWhatsAppMessage = (phone: string, message: string) => {
  try {
    // Validate input
    const validatedData = WhatsAppMessageSchema.parse({ phone, message });
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(validatedData.message);
    
    // Create WhatsApp URL (remove + from phone number for WhatsApp API)
    const cleanPhone = validatedData.phone.replace('+', '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
  } catch (error) {
    console.error('Invalid WhatsApp message data:', error);
    throw new Error('Failed to send WhatsApp message');
  }
};

/**
 * Pre-defined consultation booking message
 */
export const sendConsultationBooking = (tutorName: string, sessionType: string) => {
  const message = `Hello! I would like to book a ${sessionType} session with ${tutorName}. Please let me know about available dates and times. Thank you!`;
  
  // EduCBT support WhatsApp number (replace with actual number)
  const supportPhone = '+2348123456789';
  
  sendWhatsAppMessage(supportPhone, message);
};

/**
 * General support message
 */
export const contactSupport = (subject: string, message: string) => {
  const fullMessage = `Subject: ${subject}\n\n${message}\n\nSent from EduCBT Platform`;
  const supportPhone = '+2348123456789';
  
  sendWhatsAppMessage(supportPhone, fullMessage);
};