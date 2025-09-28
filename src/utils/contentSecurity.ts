// Content Security and Sanitization utilities
import DOMPurify from 'dompurify';

// Sanitize HTML content to prevent XSS attacks
export function sanitizeHtmlContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
      'a', 'img', 'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class'
    ],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    FORCE_BODY: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  });
}

// Sanitize text content for safe display
export function sanitizeTextContent(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Content Security Policy headers for enhanced protection
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ')
};

// Rate limiting helper for API endpoints
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this identifier
    const userRequests = requests.get(identifier) || [];
    
    // Remove requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    requests.set(identifier, validRequests);
    
    return true;
  };
}

// Input validation for common security patterns
export function validateInput(input: string, type: 'email' | 'url' | 'text' | 'alphanumeric'): boolean {
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^https?:\/\/[^\s$.?#].[^\s]*$/,
    text: /^[a-zA-Z0-9\s\-_.,!?'"()]+$/,
    alphanumeric: /^[a-zA-Z0-9]+$/
  };
  
  return patterns[type]?.test(input) || false;
}

// Security event logging (client-side for development)
export function logSecurityEvent(event: string, details: Record<string, any> = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔒 Security Event:', event, details);
  }
  
  // In production, this would send to a security monitoring service
  // Example: send to Sentry, LogRocket, or custom analytics
}