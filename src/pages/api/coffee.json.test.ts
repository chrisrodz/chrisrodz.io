import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock supabase module with null by default
vi.mock('../../lib/supabase', () => ({
  supabase: null,
}));

describe('Coffee API Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('Database Not Configured', () => {
    it('should return 503 error when database is not configured', async () => {
      const { GET } = await import('./coffee.json');
      const response = await GET({} as any);

      expect(response.status).toBe(503);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const body = await response.json();
      expect(body).toEqual({ error: 'Database not configured' });
    });
  });

  describe('Response Format', () => {
    it('should return consistent error structure when database not configured', async () => {
      const { GET } = await import('./coffee.json');
      const response = await GET({} as any);
      const body = await response.json();

      expect(body).toHaveProperty('error');
      expect(typeof body.error).toBe('string');
    });
  });
});
