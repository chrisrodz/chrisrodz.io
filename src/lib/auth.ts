import { nanoid } from 'nanoid';
import type { AstroCookies } from 'astro';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { config } from './config';
import { getServiceSupabase } from './supabase';

type SessionData = {
  id: string;
  created_at: string;
  expires_at: string;
  authenticated: boolean;
  csrf_token?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  last_activity: string;
};

// Session expiry: 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000;

const CSRF_TOKEN_LENGTH = 32;

// Helper to calculate expiry timestamp
function getExpiryTimestamp(): string {
  const expiryDate = new Date(Date.now() + SESSION_DURATION);
  return expiryDate.toISOString();
}

// Helper to check if a session is expired
function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * Creates a new authenticated session in the database
 * @param ipAddress - Optional IP address for security audit
 * @param userAgent - Optional user agent for security audit
 * @returns Session ID or null if database is not configured
 */
export async function createSession(
  ipAddress?: string,
  userAgent?: string
): Promise<string | null> {
  const supabase = getServiceSupabase();
  if (!supabase) {
    console.warn('Supabase not configured; session will not be persisted');
    return null;
  }

  const sessionId = nanoid(32);
  const now = new Date().toISOString();
  const expiresAt = getExpiryTimestamp();

  const { error } = await supabase.from('sessions').insert({
    id: sessionId,
    created_at: now,
    expires_at: expiresAt,
    authenticated: true,
    ip_address: ipAddress,
    user_agent: userAgent,
    last_activity: now,
  });

  if (error) {
    console.error('Failed to create session:', error);
    return null;
  }

  return sessionId;
}

/**
 * Validates a session ID and checks if it's authenticated and not expired
 * @param sessionId - The session ID to validate
 * @returns true if session is valid and authenticated
 */
export async function validateSession(sessionId: string | undefined): Promise<boolean> {
  if (!sessionId) return false;

  const supabase = getServiceSupabase();
  if (!supabase) {
    console.warn('Supabase not configured; cannot validate session');
    return false;
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    return false;
  }

  // Check if session is expired
  if (isSessionExpired(session.expires_at)) {
    // Clean up expired session
    await supabase.from('sessions').delete().eq('id', sessionId);
    return false;
  }

  return session.authenticated === true;
}

/**
 * Deletes a session from the database
 * @param sessionId - The session ID to delete
 */
export async function deleteSession(sessionId: string | undefined): Promise<void> {
  if (!sessionId) return;

  const supabase = getServiceSupabase();
  if (!supabase) {
    return;
  }

  await supabase.from('sessions').delete().eq('id', sessionId);
}

export function setAuthCookie(cookies: AstroCookies, sessionId: string): void {
  cookies.set('session_id', sessionId, {
    httpOnly: true,
    secure: config.env.isProd,
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  });
}

export function clearAuthCookie(cookies: AstroCookies): void {
  cookies.delete('session_id', { path: '/' });
}

/**
 * Issues a CSRF token for a session (creates session if needed)
 * @param cookies - Astro cookies object
 * @returns CSRF token or null if database not configured
 */
export async function issueCsrfToken(cookies: AstroCookies): Promise<string | null> {
  const supabase = getServiceSupabase();
  if (!supabase) {
    console.warn('Supabase not configured; cannot issue CSRF token');
    return null;
  }

  let sessionId = cookies.get('session_id')?.value;
  const token = nanoid(CSRF_TOKEN_LENGTH);
  const now = new Date().toISOString();

  // If no session exists, create an unauthenticated one
  if (!sessionId) {
    sessionId = nanoid(32);
    const expiresAt = getExpiryTimestamp();

    const { error } = await supabase.from('sessions').insert({
      id: sessionId,
      created_at: now,
      expires_at: expiresAt,
      authenticated: false,
      csrf_token: token,
      last_activity: now,
    });

    if (error) {
      console.error('Failed to create session for CSRF:', error);
      return null;
    }

    setAuthCookie(cookies, sessionId);
    return token;
  }

  // Update existing session with new CSRF token
  const { data, error } = await supabase
    .from('sessions')
    .update({
      csrf_token: token,
      last_activity: now,
    })
    .eq('id', sessionId)
    .select();

  if (error) {
    console.error('Failed to update CSRF token:', error);
    return null;
  }

  // If no rows were updated, the session was deleted (e.g., expired)
  // Create a new unauthenticated session
  if (!data || data.length === 0) {
    sessionId = nanoid(32);
    const expiresAt = getExpiryTimestamp();

    const { error: insertError } = await supabase.from('sessions').insert({
      id: sessionId,
      created_at: now,
      expires_at: expiresAt,
      authenticated: false,
      csrf_token: token,
      last_activity: now,
    });

    if (insertError) {
      console.error('Failed to create session for CSRF after stale cookie:', insertError);
      return null;
    }

    setAuthCookie(cookies, sessionId);
    return token;
  }

  return token;
}

/**
 * Validates a CSRF token against a session
 * @param sessionId - The session ID to validate against
 * @param token - The CSRF token to validate
 * @returns true if token is valid
 */
export async function validateCsrfToken(
  sessionId: string | undefined,
  token: string | undefined
): Promise<boolean> {
  if (!sessionId || !token) return false;

  const supabase = getServiceSupabase();
  if (!supabase) {
    console.warn('Supabase not configured; cannot validate CSRF token');
    return false;
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .select('csrf_token, expires_at')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    return false;
  }

  // Check if session is expired
  if (isSessionExpired(session.expires_at)) {
    await supabase.from('sessions').delete().eq('id', sessionId);
    return false;
  }

  if (!session.csrf_token) return false;
  if (session.csrf_token.length !== token.length) return false;

  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(session.csrf_token));
  } catch {
    return false;
  }
}

export const CSRF_ERROR_MESSAGE =
  'Invalid or expired session. Please refresh the page and try again.';

export type CsrfValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

/**
 * Validates CSRF token for login form submission
 * @param sessionId - The session ID from cookies
 * @param token - The CSRF token from form data
 * @returns Validation result with error message if invalid
 */
export async function validateLoginCsrf(
  sessionId: string | undefined,
  token: FormDataEntryValue | null
): Promise<CsrfValidationResult> {
  const tokenValue = typeof token === 'string' ? token : undefined;
  const isValid = await validateCsrfToken(sessionId, tokenValue);
  if (isValid) {
    return { isValid: true };
  }

  return {
    isValid: false,
    errorMessage: CSRF_ERROR_MESSAGE,
  };
}

/**
 * Checks if the current request has a valid authenticated session
 * @param cookies - Astro cookies object
 * @returns true if user is authenticated
 */
export async function checkAuth(cookies: AstroCookies): Promise<boolean> {
  const sessionId = cookies.get('session_id')?.value;
  return await validateSession(sessionId);
}

export function verifyAdminSecret(password: string): boolean {
  if (!config.auth.isConfigured()) {
    console.warn('Admin secret hash or salt not configured; rejecting authentication attempt');
    return false;
  }

  const storedHashHex = config.auth.adminSecretHash!;
  const salt = config.auth.adminSecretSalt!;

  try {
    const storedHash = Buffer.from(storedHashHex, 'hex');

    if (storedHash.length === 0) {
      console.warn('Configured admin secret hash is invalid; rejecting authentication attempt');
      return false;
    }

    const computedHash = scryptSync(password, salt, storedHash.length);

    return timingSafeEqual(computedHash, storedHash);
  } catch (error) {
    console.warn('Failed to verify admin secret; rejecting authentication attempt', error);
    return false;
  }
}
