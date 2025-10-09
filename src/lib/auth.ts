import { nanoid } from 'nanoid';
import type { AstroCookies } from 'astro';

// In-memory session store (in production, use Redis or database)
const sessions = new Map<string, { createdAt: number }>();

// Session expiry: 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export function createSession(): string {
  const sessionId = nanoid(32);
  sessions.set(sessionId, { createdAt: Date.now() });
  return sessionId;
}

export function validateSession(sessionId: string | undefined): boolean {
  if (!sessionId) return false;

  const session = sessions.get(sessionId);
  if (!session) return false;

  // Check if session has expired
  if (Date.now() - session.createdAt > SESSION_DURATION) {
    sessions.delete(sessionId);
    return false;
  }

  return true;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function setAuthCookie(cookies: AstroCookies, sessionId: string): void {
  cookies.set('session_id', sessionId, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  });
}

export function clearAuthCookie(cookies: AstroCookies): void {
  cookies.delete('session_id', { path: '/' });
}

export function checkAuth(cookies: AstroCookies): boolean {
  const sessionId = cookies.get('session_id')?.value;
  return validateSession(sessionId);
}

export function verifyAdminSecret(password: string): boolean {
  const adminSecret = import.meta.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error('ADMIN_SECRET not configured');
    return false;
  }
  return password === adminSecret;
}
