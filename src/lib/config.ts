import { z } from 'zod';

/**
 * Validates that a string is properly hex-encoded, or allows empty/undefined (for optional configs)
 * Empty strings are treated as undefined to allow graceful degradation
 */
const optionalHexString = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform((val) => (val === '' ? undefined : val))
  .refine(
    (val) => {
      // Allow undefined (not configured)
      if (val === undefined) return true;
      // Validate non-empty strings are hex
      return /^[0-9a-fA-F]+$/.test(val);
    },
    {
      message: 'Must be a valid hex-encoded string (only 0-9, a-f, A-F) or empty to disable',
    }
  );

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  // Build environment
  PROD: z.boolean().default(false),

  // Authentication
  ADMIN_SECRET_HASH: optionalHexString,
  ADMIN_SECRET_SALT: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  // Supabase (optional - enables database features)
  SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  SUPABASE_ANON_KEY: z.string().optional().or(z.literal('')),
  SUPABASE_SERVICE_KEY: z.string().optional().or(z.literal('')),

  // Strava (optional - enables activity tracking)
  STRAVA_CLIENT_ID: z.string().optional().or(z.literal('')),
  STRAVA_CLIENT_SECRET: z.string().optional().or(z.literal('')),
  STRAVA_REFRESH_TOKEN: z.string().optional().or(z.literal('')),

  // GitHub (optional - enables stats page)
  GH_PERSONAL_TOKEN: z.string().optional().or(z.literal('')),
  GITHUB_USERNAME: z.string().optional().or(z.literal('')),

  // Sentry (optional - enables error tracking)
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  PUBLIC_SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  SENTRY_AUTH_TOKEN: z.string().optional().or(z.literal('')),
  SENTRY_ORG: z.string().optional().or(z.literal('')),
  SENTRY_PROJECT: z.string().optional().or(z.literal('')),
});

/**
 * Parse and validate environment variables
 */
function parseEnv() {
  try {
    const env = {
      PROD: import.meta.env.PROD,
      ADMIN_SECRET_HASH: import.meta.env.ADMIN_SECRET_HASH,
      ADMIN_SECRET_SALT: import.meta.env.ADMIN_SECRET_SALT,
      SUPABASE_URL: import.meta.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: import.meta.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: import.meta.env.SUPABASE_SERVICE_KEY,
      STRAVA_CLIENT_ID: import.meta.env.STRAVA_CLIENT_ID,
      STRAVA_CLIENT_SECRET: import.meta.env.STRAVA_CLIENT_SECRET,
      STRAVA_REFRESH_TOKEN: import.meta.env.STRAVA_REFRESH_TOKEN,
      GH_PERSONAL_TOKEN: import.meta.env.GH_PERSONAL_TOKEN,
      GITHUB_USERNAME: import.meta.env.GITHUB_USERNAME,
      SENTRY_DSN: import.meta.env.SENTRY_DSN,
      PUBLIC_SENTRY_DSN: import.meta.env.PUBLIC_SENTRY_DSN,
      SENTRY_AUTH_TOKEN: import.meta.env.SENTRY_AUTH_TOKEN,
      SENTRY_ORG: import.meta.env.SENTRY_ORG,
      SENTRY_PROJECT: import.meta.env.SENTRY_PROJECT,
    };

    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues
        .map((err: z.ZodIssue) => {
          const path = err.path.join('.');
          return `  - ${path}: ${err.message}`;
        })
        .join('\n');

      throw new Error(
        `Environment variable validation failed:\n${formattedErrors}\n\n` +
          'Please check your .env file and ensure all required variables are properly set.\n' +
          'For admin authentication, use "yarn generate:admin-secret" to create properly formatted values.'
      );
    }
    throw error;
  }
}

/**
 * Validated environment variables
 */
const env = parseEnv();

/**
 * Type-safe configuration object
 */
export const config = {
  /**
   * Build environment configuration
   */
  env: {
    isProd: env.PROD,
  },

  /**
   * Authentication configuration
   */
  auth: {
    adminSecretHash: env.ADMIN_SECRET_HASH,
    adminSecretSalt: env.ADMIN_SECRET_SALT,

    /**
     * Check if admin authentication is configured
     */
    isConfigured(): boolean {
      return !!(this.adminSecretHash && this.adminSecretSalt);
    },
  },

  /**
   * Database configuration (Supabase)
   */
  database: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceKey: env.SUPABASE_SERVICE_KEY,

    /**
     * Check if Supabase is properly configured
     */
    isConfigured(): boolean {
      return !!(this.url && this.url.trim() && this.anonKey && this.anonKey.trim());
    },

    /**
     * Check if service key is configured (for admin operations)
     */
    hasServiceKey(): boolean {
      return !!(this.serviceKey && this.serviceKey.trim());
    },
  },

  /**
   * Strava integration configuration (optional)
   */
  strava: {
    clientId: env.STRAVA_CLIENT_ID,
    clientSecret: env.STRAVA_CLIENT_SECRET,
    refreshToken: env.STRAVA_REFRESH_TOKEN,

    /**
     * Check if Strava is properly configured
     */
    isConfigured(): boolean {
      return !!(
        this.clientId &&
        this.clientId.trim() &&
        this.clientSecret &&
        this.clientSecret.trim() &&
        this.refreshToken &&
        this.refreshToken.trim()
      );
    },
  },

  /**
   * GitHub integration configuration (optional)
   */
  github: {
    token: env.GH_PERSONAL_TOKEN,
    username: env.GITHUB_USERNAME,

    /**
     * Check if GitHub is properly configured
     */
    isConfigured(): boolean {
      return !!(this.token && this.token.trim() && this.username && this.username.trim());
    },
  },

  /**
   * Sentry error tracking configuration (optional)
   */
  sentry: {
    dsn: env.SENTRY_DSN,
    publicDsn: env.PUBLIC_SENTRY_DSN,
    authToken: env.SENTRY_AUTH_TOKEN,
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,

    /**
     * Check if Sentry is properly configured
     */
    isConfigured(): boolean {
      return !!(this.dsn && this.dsn.trim());
    },
  },
} as const;

/**
 * Type of the configuration object
 */
export type Config = typeof config;
