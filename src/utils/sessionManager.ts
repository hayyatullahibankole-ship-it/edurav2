import { supabase } from '@/integrations/supabase/client';

const SESSION_TOKEN_KEY = 'edura_session_token';

// Generate a unique session token
export function generateSessionToken(): string {
  return `${crypto.randomUUID()}-${Date.now()}`;
}

// Store session token in localStorage
export function storeSessionToken(token: string): void {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

// Get session token from localStorage
export function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

// Clear session token from localStorage
export function clearSessionToken(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

// Validate session token against database
export async function validateSessionToken(
  userAuthId: string,
  token: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_session_valid', {
      user_auth_id: userAuthId,
      token_to_check: token,
    });

    if (error) {
      console.error('Session validation error:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
}

// Set new session token in database
export async function setSessionToken(
  userAuthId: string,
  token: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('validate_and_set_session_token', {
      user_auth_id: userAuthId,
      new_token: token,
    });

    if (error) {
      console.error('Failed to set session token:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Set session token failed:', error);
    return false;
  }
}

// Clear session token from database
export async function clearSessionTokenInDB(userAuthId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('clear_session_token', {
      user_auth_id: userAuthId,
    });

    if (error) {
      console.error('Failed to clear session token:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Clear session token failed:', error);
    return false;
  }
}
