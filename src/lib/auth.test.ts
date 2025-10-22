import { describe, it, expect, vi, beforeEach } from 'vitest';
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
import * as supabaseModule from './supabase';

// Mock storage for sessions
const mockSessionsDb = new Map<string, any>();

// Mock Supabase client
const createMockSupabaseClient = () => ({
  from: (table: string) => ({
    insert: vi.fn(async (data: any) => {
      if (table === 'sessions') {
        mockSessionsDb.set(data.id, data);
        return { data, error: null };
      }
      return { data: null, error: new Error('Table not found') };
    }),
    select: vi.fn((columns: string) => ({
      eq: vi.fn((column: string, value: any) => ({
        single: vi.fn(async () => {
          if (table === 'sessions') {
            const session = mockSessionsDb.get(value);
            return session
              ? { data: session, error: null }
              : { data: null, error: new Error('Not found') };
          }
          return { data: null, error: new Error('Table not found') };
        }),
      })),
    })),
    update: vi.fn((updates: any) => ({
      eq: vi.fn(async (column: string, value: any) => {
        if (table === 'sessions' && mockSessionsDb.has(value)) {
          const session = mockSessionsDb.get(value);
          mockSessionsDb.set(value, { ...session, ...updates });
          return { data: { ...session, ...updates }, error: null };
        }
        return { data: null, error: new Error('Not found') };
      }),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(async (column: string, value: any) => {
        if (table === 'sessions') {
          mockSessionsDb.delete(value);
          return { data: null, error: null };
        }
        return { data: null, error: new Error('Table not found') };
      }),
    })),
  }),
});

// Mock getServiceSupabase
vi.spyOn(supabaseModule, 'getServiceSupabase').mockImplementation(
  () => createMockSupabaseClient() as any
);

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
  beforeEach(() => {
    // Clear mock database before each test
    mockSessionsDb.clear();
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a session with a valid session ID', async () => {
      const sessionId = await createSession();
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId?.length).toBe(32);
    });

    it('should create unique session IDs', async () => {
      const sessionId1 = await createSession();
      const sessionId2 = await createSession();
      expect(sessionId1).not.toBe(sessionId2);
    });

    it('should create a valid session that can be validated', async () => {
      const sessionId = await createSession();
      expect(sessionId).toBeDefined();
      const isValid = await validateSession(sessionId!);
      expect(isValid).toBe(true);
    });

    it('should store IP address and user agent if provided', async () => {
      const sessionId = await createSession('192.168.1.1', 'Mozilla/5.0');
      expect(sessionId).toBeDefined();
      const session = mockSessionsDb.get(sessionId!);
      expect(session.ip_address).toBe('192.168.1.1');
      expect(session.user_agent).toBe('Mozilla/5.0');
    });
  });

  describe('validateSession', () => {
    it('should return false for undefined session ID', async () => {
      const isValid = await validateSession(undefined);
      expect(isValid).toBe(false);
    });

    it('should return false for non-existent session ID', async () => {
      const isValid = await validateSession('non-existent-session-id');
      expect(isValid).toBe(false);
    });

    it('should return true for valid session', async () => {
      const sessionId = await createSession();
      expect(sessionId).toBeDefined();
      const isValid = await validateSession(sessionId!);
      expect(isValid).toBe(true);
    });

    it('should return false for expired session', async () => {
      const sessionId = await createSession();
      expect(sessionId).toBeDefined();

      // Manually set expiry to past
      const session = mockSessionsDb.get(sessionId!);
      session.expires_at = new Date(Date.now() - 1000).toISOString();
      mockSessionsDb.set(sessionId!, session);

      const isValid = await validateSession(sessionId!);
      expect(isValid).toBe(false);
    });

    it('should delete expired session when validating', async () => {
      const sessionId = await createSession();
      expect(sessionId).toBeDefined();

      // Manually set expiry to past
      const session = mockSessionsDb.get(sessionId!);
      session.expires_at = new Date(Date.now() - 1000).toISOString();
      mockSessionsDb.set(sessionId!, session);

      // First validation should return false and delete the session
      await validateSession(sessionId!);

      // Session should be deleted from mock DB
      expect(mockSessionsDb.has(sessionId!)).toBe(false);
    });
  });

  describe('deleteSession', () => {
    it('should delete a valid session', async () => {
      const sessionId = await createSession();
      expect(sessionId).toBeDefined();
      expect(await validateSession(sessionId!)).toBe(true);

      await deleteSession(sessionId!);
      expect(await validateSession(sessionId!)).toBe(false);
    });

    it('should handle deleting undefined session gracefully', async () => {
      await expect(deleteSession(undefined)).resolves.not.toThrow();
    });

    it('should handle deleting non-existent session gracefully', async () => {
      await expect(deleteSession('non-existent-session-id')).resolves.not.toThrow();
    });
  });

  describe('CSRF tokens', () => {
    it('should issue and validate a CSRF token for a session', async () => {
      const cookies = createMockCookies();
      const token = await issueCsrfToken(cookies);
      const sessionId = cookies.get('session_id')?.value;

      expect(typeof token).toBe('string');
      expect(token).not.toBeNull();
      expect(token?.length).toBeGreaterThan(0);
      expect(sessionId).toBeDefined();
      expect(await validateCsrfToken(sessionId, token!)).toBe(true);

      await deleteSession(sessionId);
    });

    it('should reject missing or invalid CSRF tokens', async () => {
      const cookies = createMockCookies();
      const token = await issueCsrfToken(cookies);
      const sessionId = cookies.get('session_id')?.value;
      expect(sessionId).toBeDefined();

      expect(await validateCsrfToken(sessionId, undefined)).toBe(false);
      expect(await validateCsrfToken(sessionId, 'invalid-token')).toBe(false);

      const validationResult = await validateLoginCsrf(sessionId, 'invalid-token');
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errorMessage).toBe(CSRF_ERROR_MESSAGE);

      await deleteSession(sessionId);
      expect(await validateCsrfToken(sessionId, token!)).toBe(false);
    });

    it('should rotate the CSRF token when re-issued', async () => {
      const cookies = createMockCookies();
      const firstToken = await issueCsrfToken(cookies);
      const sessionId = cookies.get('session_id')?.value;
      expect(sessionId).toBeDefined();

      const secondToken = await issueCsrfToken(cookies);
      expect(secondToken).not.toBe(firstToken);
      expect(await validateCsrfToken(sessionId, firstToken!)).toBe(false);
      expect(await validateCsrfToken(sessionId, secondToken!)).toBe(true);

      await deleteSession(sessionId);
    });
  });
});
