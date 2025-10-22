import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('config', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    // Clear module cache to reload config with new env vars
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env
    Object.keys(import.meta.env).forEach((key) => {
      delete import.meta.env[key];
    });
    Object.assign(import.meta.env, originalEnv);
  });

  describe('admin authentication', () => {
    it('should handle empty admin secret values gracefully', async () => {
      // Simulate .env.example copied as-is (empty strings)
      import.meta.env.ADMIN_SECRET_HASH = '';
      import.meta.env.ADMIN_SECRET_SALT = '';

      // Should not throw when importing
      const { config } = await import('./config');

      expect(config.auth.isConfigured()).toBe(false);
      expect(config.auth.adminSecretHash).toBeUndefined();
      expect(config.auth.adminSecretSalt).toBeUndefined();
    });

    it('should handle undefined admin secret values', async () => {
      // Simulate missing env vars
      delete import.meta.env.ADMIN_SECRET_HASH;
      delete import.meta.env.ADMIN_SECRET_SALT;

      const { config } = await import('./config');

      expect(config.auth.isConfigured()).toBe(false);
      expect(config.auth.adminSecretHash).toBeUndefined();
      expect(config.auth.adminSecretSalt).toBeUndefined();
    });

    it('should validate and accept properly formatted hex values', async () => {
      const validHash = 'a1b2c3d4e5f67890';
      const validSalt = '1234567890abcdef';

      import.meta.env.ADMIN_SECRET_HASH = validHash;
      import.meta.env.ADMIN_SECRET_SALT = validSalt;

      const { config } = await import('./config');

      expect(config.auth.isConfigured()).toBe(true);
      expect(config.auth.adminSecretHash).toBe(validHash);
      expect(config.auth.adminSecretSalt).toBe(validSalt);
    });

    it('should reject invalid hex values', async () => {
      import.meta.env.ADMIN_SECRET_HASH = 'not-hex-value!';
      import.meta.env.ADMIN_SECRET_SALT = 'salt123';

      await expect(async () => {
        await import('./config');
      }).rejects.toThrow(/Must be a valid hex-encoded string/);
    });

    it('should require both hash and salt for auth to be configured', async () => {
      // Only hash set
      import.meta.env.ADMIN_SECRET_HASH = 'a1b2c3d4e5f67890';
      import.meta.env.ADMIN_SECRET_SALT = '';

      let configModule = await import('./config');
      expect(configModule.config.auth.isConfigured()).toBe(false);

      vi.resetModules();

      // Only salt set
      import.meta.env.ADMIN_SECRET_HASH = '';
      import.meta.env.ADMIN_SECRET_SALT = 'salt123';

      configModule = await import('./config');
      expect(configModule.config.auth.isConfigured()).toBe(false);
    });
  });

  describe('database configuration', () => {
    it('should handle empty database values gracefully', async () => {
      import.meta.env.SUPABASE_URL = '';
      import.meta.env.SUPABASE_ANON_KEY = '';
      import.meta.env.SUPABASE_SERVICE_KEY = '';

      const { config } = await import('./config');

      expect(config.database.isConfigured()).toBe(false);
      expect(config.database.hasServiceKey()).toBe(false);
    });

    it('should handle missing database values', async () => {
      delete import.meta.env.SUPABASE_URL;
      delete import.meta.env.SUPABASE_ANON_KEY;
      delete import.meta.env.SUPABASE_SERVICE_KEY;

      const { config } = await import('./config');

      expect(config.database.isConfigured()).toBe(false);
      expect(config.database.hasServiceKey()).toBe(false);
    });

    it('should validate properly configured database', async () => {
      import.meta.env.SUPABASE_URL = 'https://example.supabase.co';
      import.meta.env.SUPABASE_ANON_KEY = 'anon-key-123';
      import.meta.env.SUPABASE_SERVICE_KEY = 'service-key-456';

      const { config } = await import('./config');

      expect(config.database.isConfigured()).toBe(true);
      expect(config.database.hasServiceKey()).toBe(true);
    });
  });

  describe('strava configuration', () => {
    it('should handle empty strava values gracefully', async () => {
      import.meta.env.STRAVA_CLIENT_ID = '';
      import.meta.env.STRAVA_CLIENT_SECRET = '';
      import.meta.env.STRAVA_REFRESH_TOKEN = '';

      const { config } = await import('./config');

      expect(config.strava.isConfigured()).toBe(false);
    });

    it('should validate properly configured strava', async () => {
      import.meta.env.STRAVA_CLIENT_ID = 'client-123';
      import.meta.env.STRAVA_CLIENT_SECRET = 'secret-456';
      import.meta.env.STRAVA_REFRESH_TOKEN = 'refresh-789';

      const { config } = await import('./config');

      expect(config.strava.isConfigured()).toBe(true);
    });
  });
});
