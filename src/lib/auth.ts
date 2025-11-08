import { nanoid } from 'nanoid';
import type { AstroCookies } from 'astro';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { config } from './config';

type SessionData = {
  createdAt: number;
  authenticated: boolean;
  csrfToken?: string;
};

// In-memory session store (in production, use Redis or database)
const sessions = new Map<string, SessionData>();

// Session expiry: 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000;

const CSRF_TOKEN_LENGTH = 32;

function isSessionExpired(session: SessionData): boolean {
  return Date.now() - session.createdAt > SESSION_DURATION;
}

function ensureSessionEntry(sessionId: string | undefined): {
  sessionId: string;
  session: SessionData;
} {
  if (sessionId) {
    const existing = sessions.get(sessionId);
    if (existing) {
      if (isSessionExpired(existing)) {
        sessions.delete(sessionId);
      } else {
        return { sessionId, session: existing };
      }
    }
  }

  const newSessionId = nanoid(32);
  const session: SessionData = {
    createdAt: Date.now(),
    authenticated: false,
  };
  sessions.set(newSessionId, session);
  return { sessionId: newSessionId, session };
}

export function createSession(): string {
  const sessionId = nanoid(32);
  sessions.set(sessionId, { createdAt: Date.now(), authenticated: true });
  return sessionId;
}

export function validateSession(sessionId: string | undefined): boolean {
  if (!sessionId) return false;

  const session = sessions.get(sessionId);
  if (!session) return false;

  if (isSessionExpired(session)) {
    sessions.delete(sessionId);
    return false;
  }

  return true;
}

export function deleteSession(sessionId: string | undefined): void {
  if (!sessionId) return;
  sessions.delete(sessionId);
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

export function issueCsrfToken(cookies: AstroCookies): string {
  const currentSessionId = cookies.get('session_id')?.value;
  const { sessionId, session } = ensureSessionEntry(currentSessionId);
  const token = nanoid(CSRF_TOKEN_LENGTH);
  session.csrfToken = token;
  setAuthCookie(cookies, sessionId);
  return token;
}

export function validateCsrfToken(
  sessionId: string | undefined,
  token: string | undefined
): boolean {
  if (!sessionId || !token) return false;

  const session = sessions.get(sessionId);
  if (!session) return false;

  if (isSessionExpired(session)) {
    sessions.delete(sessionId);
    return false;
  }

  if (!session.csrfToken) return false;
  if (session.csrfToken.length !== token.length) return false;

  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(session.csrfToken));
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

export function validateLoginCsrf(
  sessionId: string | undefined,
  token: FormDataEntryValue | null
): CsrfValidationResult {
  const tokenValue = typeof token === 'string' ? token : undefined;
  const isValid = validateCsrfToken(sessionId, tokenValue);
  if (isValid) {
    return { isValid: true };
  }

  return {
    isValid: false,
    errorMessage: CSRF_ERROR_MESSAGE,
  };
}

export function checkAuth(cookies: AstroCookies): boolean {
  const sessionId = cookies.get('session_id')?.value;
  if (!validateSession(sessionId)) {
    return false;
  }

  const session = sessions.get(sessionId!);
  return session?.authenticated === true;
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
