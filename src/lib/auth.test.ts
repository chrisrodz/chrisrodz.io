import { describe, it, expect, vi } from 'vitest';
import type { AstroCookies } from 'astro';
import {
  createSession,
  validateSession,
  deleteSession,
  issueCsrfToken,
  validateCsrfToken,
  validateLoginCsrf,
  CSRF_ERROR_MESSAGE,
} from './auth';

function createMockCookies(initial: Record<string, string> = {}): AstroCookies {
  const store = new Map(Object.entries(initial));
  return {
    get(name: string) {
      const value = store.get(name);
      return value ? ({ value } as { value: string }) : undefined;
    },
    set(name: string, value: string) {
      store.set(name, value);
    },
    delete(name: string) {
      store.delete(name);
    },
  } as unknown as AstroCookies;
}

describe('Auth Module', () => {
  describe('createSession', () => {
    it('should create a session with a valid session ID', () => {
      const sessionId = createSession();
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBe(32);
    });

    it('should create unique session IDs', () => {
      const sessionId1 = createSession();
      const sessionId2 = createSession();
      expect(sessionId1).not.toBe(sessionId2);
    });

    it('should create a valid session that can be validated', () => {
      const sessionId = createSession();
      const isValid = validateSession(sessionId);
      expect(isValid).toBe(true);
    });
  });

  describe('validateSession', () => {
    it('should return false for undefined session ID', () => {
      const isValid = validateSession(undefined);
      expect(isValid).toBe(false);
    });

    it('should return false for non-existent session ID', () => {
      const isValid = validateSession('non-existent-session-id');
      expect(isValid).toBe(false);
    });

    it('should return true for valid session', () => {
      const sessionId = createSession();
      const isValid = validateSession(sessionId);
      expect(isValid).toBe(true);
    });

    it('should return false for expired session', () => {
      // Create a session
      const sessionId = createSession();

      // Mock Date.now to simulate time passing (25 hours)
      const realDateNow = Date.now.bind(global.Date);
      const mockNow = realDateNow();
      vi.spyOn(Date, 'now').mockImplementation(() => mockNow + 25 * 60 * 60 * 1000);

      const isValid = validateSession(sessionId);
      expect(isValid).toBe(false);

      // Restore Date.now
      vi.restoreAllMocks();
    });

    it('should delete expired session when validating', () => {
      const sessionId = createSession();

      // Mock Date.now to simulate time passing (25 hours)
      const realDateNow = Date.now.bind(global.Date);
      const mockNow = realDateNow();
      vi.spyOn(Date, 'now').mockImplementation(() => mockNow + 25 * 60 * 60 * 1000);

      // First validation should return false and delete the session
      validateSession(sessionId);

      // Restore Date.now
      vi.restoreAllMocks();

      // Second validation should also return false (session was deleted)
      const isValid = validateSession(sessionId);
      expect(isValid).toBe(false);
    });
  });

  describe('deleteSession', () => {
    it('should delete a valid session', () => {
      const sessionId = createSession();
      expect(validateSession(sessionId)).toBe(true);

      deleteSession(sessionId);
      expect(validateSession(sessionId)).toBe(false);
    });

    it('should handle deleting undefined session gracefully', () => {
      expect(() => deleteSession(undefined)).not.toThrow();
    });

    it('should handle deleting non-existent session gracefully', () => {
      expect(() => deleteSession('non-existent-session-id')).not.toThrow();
    });
  });

  describe('CSRF tokens', () => {
    it('should issue and validate a CSRF token for a session', () => {
      const cookies = createMockCookies();
      const token = issueCsrfToken(cookies);
      const sessionId = cookies.get('session_id')?.value;

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(sessionId).toBeDefined();
      expect(validateCsrfToken(sessionId, token)).toBe(true);

      deleteSession(sessionId);
    });

    it('should reject missing or invalid CSRF tokens', () => {
      const cookies = createMockCookies();
      const token = issueCsrfToken(cookies);
      const sessionId = cookies.get('session_id')?.value;
      expect(sessionId).toBeDefined();

      expect(validateCsrfToken(sessionId, undefined)).toBe(false);
      expect(validateCsrfToken(sessionId, 'invalid-token')).toBe(false);

      const validationResult = validateLoginCsrf(sessionId, 'invalid-token');
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errorMessage).toBe(CSRF_ERROR_MESSAGE);

      deleteSession(sessionId);
      expect(validateCsrfToken(sessionId, token)).toBe(false);
    });

    it('should rotate the CSRF token when re-issued', () => {
      const cookies = createMockCookies();
      const firstToken = issueCsrfToken(cookies);
      const sessionId = cookies.get('session_id')?.value;
      expect(sessionId).toBeDefined();

      const secondToken = issueCsrfToken(cookies);
      expect(secondToken).not.toBe(firstToken);
      expect(validateCsrfToken(sessionId, firstToken)).toBe(false);
      expect(validateCsrfToken(sessionId, secondToken)).toBe(true);

      deleteSession(sessionId);
    });
  });
});
