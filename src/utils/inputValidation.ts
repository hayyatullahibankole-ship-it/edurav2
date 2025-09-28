import { z } from 'zod';

// Comprehensive input validation schemas for security
export const emailSchema = z.string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

export const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(100, { message: "Password must be less than 100 characters" })
  .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter" })
  .regex(/\d/, { message: "Password must contain at least one number" });

export const nameSchema = z.string()
  .trim()
  .min(1, { message: "Name cannot be empty" })
  .max(100, { message: "Name must be less than 100 characters" })
  .regex(/^[a-zA-Z\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens and apostrophes" });

export const phoneSchema = z.string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" })
  .max(20, { message: "Phone number too long" });

export const textContentSchema = z.string()
  .trim()
  .min(1, { message: "Content cannot be empty" })
  .max(5000, { message: "Content must be less than 5000 characters" });

// Admin-specific validation schemas
export const adminUserSchema = z.object({
  email: emailSchema,
  first_name: nameSchema,
  last_name: nameSchema,
  role: z.enum(['admin', 'super_admin'], { message: "Invalid role" })
});

export const blogPostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: textContentSchema,
  excerpt: z.string().trim().max(500).optional(),
  category: z.string().trim().min(1).max(50),
  tags: z.array(z.string().trim().max(50)).max(10)
});

export const questionSchema = z.object({
  question_text: textContentSchema,
  type: z.enum(['multiple_choice', 'true_false', 'essay'], { message: "Invalid question type" }),
  options: z.record(z.string()).optional(),
  correct_answer: z.unknown(), // Validated based on question type
  explanation: z.string().max(1000).optional(),
  difficulty_level: z.number().min(1).max(5),
  points: z.number().min(0).max(100),
  subject_id: z.string().uuid()
});

// Utility function to sanitize HTML input (basic XSS prevention)
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Rate limiting validation
export function validateRateLimit(requests: number, windowMinutes: number, maxRequests: number): boolean {
  const requestsPerMinute = requests / windowMinutes;
  return requestsPerMinute <= (maxRequests / windowMinutes);
}

// Input length validation for security
export function validateInputLength(input: string, maxLength: number): boolean {
  return input.length <= maxLength;
}