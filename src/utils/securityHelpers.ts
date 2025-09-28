// Security utility functions

// Basic IP address validation
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Generate device fingerprint for tracking
export function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Device fingerprint text', 2, 2);
  
  const fingerprint = {
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    userAgent: navigator.userAgent.slice(0, 100), // Truncate for privacy
    canvas: canvas.toDataURL().slice(-50), // Last 50 chars for uniqueness
  };
  
  return btoa(JSON.stringify(fingerprint)).slice(0, 32);
}

// Secure session validation
export function validateSession(sessionData: any): boolean {
  if (!sessionData || !sessionData.user) return false;
  
  const now = new Date();
  const expiresAt = new Date(sessionData.expires_at);
  
  return expiresAt > now;
}

// Content Security Policy helpers
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Prevent timing attacks on string comparison
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// Log security events (client-side logging for development)
export function logSecurityEvent(event: string, details: any = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Security Event:', event, details);
  }
  
  // In production, this would send to a logging service
  // fetch('/api/security-log', { 
  //   method: 'POST', 
  //   body: JSON.stringify({ event, details, timestamp: new Date() }) 
  // });
}

// Check for suspicious patterns in user input
export function detectSuspiciousInput(input: string): boolean {
  const suspiciousPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /data:text\/html/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /document\.cookie/i,
    /window\.location/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}