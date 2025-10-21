import { describe, it, expect, vi } from 'vitest';
import { createSession, validateSession, deleteSession } from './auth';

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
});
