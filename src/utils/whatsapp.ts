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
    
    // Create WhatsApp URL (remove + from phone number)
    const cleanPhone = validatedData.phone.replace('+', '');
    
    // Try multiple WhatsApp URL formats as fallback
    const whatsappUrls = [
      `https://wa.me/${cleanPhone}?text=${encodedMessage}`,
      `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`,
      `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`
    ];
    
    // Try opening WhatsApp with fallback options
    let opened = false;
    
    // First try wa.me (most reliable)
    try {
      const popup = window.open(whatsappUrls[0], '_blank');
      if (popup && !popup.closed) {
        opened = true;
      }
    } catch (e) {
      console.warn('wa.me failed, trying alternatives');
    }
    
    // If wa.me failed, try web.whatsapp.com
    if (!opened) {
      try {
        const popup = window.open(whatsappUrls[1], '_blank');
        if (popup && !popup.closed) {
          opened = true;
        }
      } catch (e) {
        console.warn('web.whatsapp.com failed, trying mobile protocol');
      }
    }
    
    // Last resort: try mobile protocol (works on mobile devices)
    if (!opened) {
      try {
        window.location.href = whatsappUrls[2];
        opened = true;
      } catch (e) {
        console.error('All WhatsApp methods failed');
      }
    }
    
    if (!opened) {
      throw new Error('Unable to open WhatsApp. Please ensure WhatsApp is installed or try accessing WhatsApp Web directly.');
    }
    
  } catch (error) {
    console.error('WhatsApp message error:', error);
    throw error instanceof Error ? error : new Error('Failed to send WhatsApp message');
  }
};

/**
 * Pre-defined consultation booking message
 */
export const sendConsultationBooking = (tutorName: string, sessionType: string) => {
  const message = `Hello! I would like to book a ${sessionType} session with ${tutorName}. Please let me know about available dates and times. Thank you!`;
  
  // EduCore support WhatsApp number
  const supportPhone = '+2348101466977';
  
  sendWhatsAppMessage(supportPhone, message);
};

/**
 * General support message
 */
export const contactSupport = (subject: string, message: string) => {
  const fullMessage = `Subject: ${subject}\n\n${message}\n\nSent from EduCore Platform`;
  const supportPhone = '+2348101466977';
  
  sendWhatsAppMessage(supportPhone, fullMessage);
};