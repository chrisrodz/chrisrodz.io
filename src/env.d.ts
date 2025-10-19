/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_KEY: string;
  readonly ADMIN_SECRET_HASH: string;
  readonly ADMIN_SECRET_SALT: string;
  readonly STRAVA_CLIENT_ID: string;
  readonly STRAVA_CLIENT_SECRET: string;
  readonly STRAVA_REFRESH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
