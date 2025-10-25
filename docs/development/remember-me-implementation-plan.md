# Implementation Plan: "Remember Me" with Persistent Sessions (APPROACH 2)

## Executive Summary

This document provides a comprehensive implementation plan for adding a "Remember Me" feature to the admin authentication system. This approach extends the current session-based authentication with optional persistent sessions stored in the database.

**Complexity**: **Moderate**
**Estimated Time**: 6-8 hours
**Risk Level**: Low-Medium (requires database changes, cookie handling changes)

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Implementation Steps](#implementation-steps)
3. [Pros and Cons](#pros-and-cons)
4. [Security Considerations](#security-considerations)
5. [Database Schema Changes](#database-schema-changes)
6. [Cookie Security Settings](#cookie-security-settings)
7. [Best Practices](#best-practices)
8. [Edge Cases and Issues](#edge-cases-and-issues)
9. [Testing Strategy](#testing-strategy)
10. [Rollback Plan](#rollback-plan)

---

## Current State Analysis

### Existing Authentication System

**Session Management** (`/home/user/chrisrodz.io/src/lib/auth.ts`):
- In-memory Map storage for sessions
- 24-hour session expiry (86,400,000ms)
- Session ID: 32-character nanoid
- Session data structure:
  ```typescript
  type SessionData = {
    createdAt: number;
    authenticated: boolean;
    csrfToken?: string;
  };
  ```

**Cookie Configuration**:
- Name: `session_id`
- HttpOnly: `true`
- Secure: `true` (production only)
- SameSite: `lax`
- MaxAge: 86,400 seconds (24 hours)
- Path: `/`

**Security Features**:
- CSRF protection with token rotation
- Rate limiting (5 attempts/10min, 15min cooldown)
- Timing-safe password comparison (scrypt + salt)
- Comprehensive security headers (CSP, HSTS, X-Frame-Options)

**Current Pain Points**:
1. Sessions are lost on server restart (in-memory storage)
2. Users must re-authenticate every 24 hours
3. No option for longer-lived sessions
4. Cannot revoke sessions remotely (no database persistence)

---

## Implementation Steps

### Phase 1: Database Schema (1 hour)

#### 1.1 Create Migration File

**File**: `/home/user/chrisrodz.io/supabase/migrations/YYYYMMDDHHMMSS_add_persistent_sessions.sql`

```sql
-- Persistent Sessions Table
-- Stores long-lived "remember me" tokens for admin authentication

create table public.persistent_sessions (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  expires_at timestamp with time zone not null,
  last_used_at timestamp with time zone not null default timezone('utc'::text, now()),

  -- Token hash (never store raw tokens)
  token_hash text not null unique,

  -- Identifier for the user/admin (could be email, username, or just 'admin')
  user_identifier text not null default 'admin',

  -- User agent and IP for security audit
  user_agent text null,
  ip_address text null,

  -- Revocation support
  revoked boolean not null default false,
  revoked_at timestamp with time zone null,
  revocation_reason text null,

  constraint persistent_sessions_pkey primary key (id),
  constraint persistent_sessions_token_hash_key unique (token_hash)
) tablespace pg_default;

-- Indexes for performance
create index if not exists persistent_sessions_token_hash_idx
  on public.persistent_sessions using btree (token_hash)
  tablespace pg_default;

create index if not exists persistent_sessions_expires_at_idx
  on public.persistent_sessions using btree (expires_at)
  tablespace pg_default;

create index if not exists persistent_sessions_user_identifier_idx
  on public.persistent_sessions using btree (user_identifier)
  tablespace pg_default;

-- Partial index for active sessions only
create index if not exists persistent_sessions_active_idx
  on public.persistent_sessions using btree (expires_at, revoked)
  tablespace pg_default
  where (revoked = false and expires_at > now());

-- Enable Row Level Security
alter table persistent_sessions enable row level security;

-- No public access to sessions (app-level auth only)
-- The ADMIN_SECRET in the application handles all session operations

-- Cleanup function for expired sessions
create or replace function cleanup_expired_sessions()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.persistent_sessions
  where expires_at < now() - interval '30 days'; -- Keep 30 days for audit
end;
$$;

-- Optional: Schedule cleanup (requires pg_cron extension)
-- select cron.schedule('cleanup-expired-sessions', '0 2 * * *', 'select cleanup_expired_sessions();');

comment on table public.persistent_sessions is 'Stores persistent "remember me" tokens for admin authentication';
comment on column public.persistent_sessions.token_hash is 'SHA-256 hash of the remember me token (never store plaintext)';
comment on column public.persistent_sessions.expires_at is 'Token expiration timestamp (typically 30-90 days)';
comment on column public.persistent_sessions.last_used_at is 'Last time this token was used (updated on each validation)';
comment on column public.persistent_sessions.revoked is 'Whether this token has been manually revoked';
```

#### 1.2 Generate TypeScript Types

```bash
yarn db:push
yarn db:types
```

### Phase 2: Authentication Library Updates (2-3 hours)

#### 2.1 Update Session Types

**File**: `/home/user/chrisrodz.io/src/lib/auth.ts`

Add new types at the top of the file:

```typescript
type SessionType = 'temporary' | 'persistent';

type SessionData = {
  createdAt: number;
  authenticated: boolean;
  csrfToken?: string;
  sessionType: SessionType; // NEW
  persistentTokenId?: string; // NEW: UUID of DB token if persistent
};

interface PersistentTokenData {
  tokenHash: string;
  expiresAt: Date;
  userIdentifier: string;
  userAgent?: string;
  ipAddress?: string;
}
```

#### 2.2 Add Token Generation and Hashing Functions

```typescript
import { createHash } from 'node:crypto';

// Generate cryptographically secure random token
function generateSecureToken(): string {
  // Generate 32 bytes (256 bits) of random data
  // Base64url encoding for URL-safe tokens
  return nanoid(64); // 64 chars = ~384 bits entropy
}

// Hash token for database storage (SHA-256)
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
```

#### 2.3 Create Persistent Session Functions

```typescript
import { supabase } from './supabase';

const PERSISTENT_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

interface CreatePersistentSessionOptions {
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Creates a persistent "remember me" token in the database
 * Returns the plaintext token (only time it's ever in plaintext)
 */
export async function createPersistentSession(
  options: CreatePersistentSessionOptions = {}
): Promise<{ token: string; sessionId: string } | null> {
  if (!supabase) {
    console.warn('Cannot create persistent session: database not configured');
    return null;
  }

  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + PERSISTENT_SESSION_DURATION);

  const { data, error } = await supabase
    .from('persistent_sessions')
    .insert({
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      user_identifier: 'admin', // Future: could be email or username
      user_agent: options.userAgent || null,
      ip_address: options.ipAddress || null,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Failed to create persistent session:', error);
    return null;
  }

  // Create in-memory session linked to persistent token
  const sessionId = nanoid(32);
  sessions.set(sessionId, {
    createdAt: Date.now(),
    authenticated: true,
    sessionType: 'persistent',
    persistentTokenId: data.id,
  });

  return { token, sessionId };
}

/**
 * Validates a persistent token and creates/refreshes in-memory session
 */
export async function validatePersistentToken(
  token: string
): Promise<string | null> {
  if (!supabase || !token) return null;

  const tokenHash = hashToken(token);

  // Fetch and validate token
  const { data, error } = await supabase
    .from('persistent_sessions')
    .select('id, expires_at, revoked')
    .eq('token_hash', tokenHash)
    .single();

  if (error || !data) {
    return null;
  }

  // Check if revoked
  if (data.revoked) {
    console.warn('Attempted use of revoked persistent token');
    return null;
  }

  // Check if expired
  const expiresAt = new Date(data.expires_at);
  if (expiresAt < new Date()) {
    // Clean up expired token
    await supabase
      .from('persistent_sessions')
      .delete()
      .eq('id', data.id);
    return null;
  }

  // Update last_used_at timestamp
  await supabase
    .from('persistent_sessions')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  // Create in-memory session
  const sessionId = nanoid(32);
  sessions.set(sessionId, {
    createdAt: Date.now(),
    authenticated: true,
    sessionType: 'persistent',
    persistentTokenId: data.id,
  });

  return sessionId;
}

/**
 * Revokes a persistent token
 */
export async function revokePersistentToken(
  tokenId: string,
  reason?: string
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('persistent_sessions')
    .update({
      revoked: true,
      revoked_at: new Date().toISOString(),
      revocation_reason: reason || null,
    })
    .eq('id', tokenId);

  return !error;
}

/**
 * Revokes all persistent tokens for a user
 */
export async function revokeAllPersistentSessions(
  userIdentifier: string = 'admin'
): Promise<number> {
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from('persistent_sessions')
    .update({
      revoked: true,
      revoked_at: new Date().toISOString(),
      revocation_reason: 'Revoked all sessions',
    })
    .eq('user_identifier', userIdentifier)
    .eq('revoked', false)
    .select('id');

  if (error || !data) return 0;
  return data.length;
}
```

#### 2.4 Update Cookie Management Functions

```typescript
/**
 * Sets both temporary session cookie and persistent token cookie
 */
export function setRememberMeCookies(
  cookies: AstroCookies,
  sessionId: string,
  persistentToken: string
): void {
  // Set temporary session cookie (24 hours)
  setAuthCookie(cookies, sessionId);

  // Set persistent token cookie (30 days)
  cookies.set('remember_token', persistentToken, {
    httpOnly: true,
    secure: config.env.isProd,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    path: '/',
  });
}

/**
 * Clears both session and persistent token cookies
 */
export function clearAllAuthCookies(cookies: AstroCookies): void {
  clearAuthCookie(cookies);
  cookies.delete('remember_token', { path: '/' });
}

/**
 * Gets the persistent token from cookies
 */
export function getPersistentToken(cookies: AstroCookies): string | null {
  return cookies.get('remember_token')?.value || null;
}
```

#### 2.5 Update checkAuth Function

```typescript
/**
 * Checks authentication, auto-restoring from persistent token if needed
 */
export async function checkAuth(cookies: AstroCookies): Promise<boolean> {
  const sessionId = cookies.get('session_id')?.value;

  // Check existing session first
  if (validateSession(sessionId)) {
    const session = sessionId ? sessions.get(sessionId) : null;
    if (session?.authenticated) {
      return true;
    }
  }

  // Try to restore from persistent token
  const persistentToken = getPersistentToken(cookies);
  if (persistentToken) {
    const newSessionId = await validatePersistentToken(persistentToken);
    if (newSessionId) {
      // Update session cookie with new session
      setAuthCookie(cookies, newSessionId);
      return true;
    } else {
      // Token invalid, clear cookie
      cookies.delete('remember_token', { path: '/' });
    }
  }

  return false;
}
```

**IMPORTANT**: This changes `checkAuth` from synchronous to asynchronous. All callers must be updated.

#### 2.6 Update deleteSession Function

```typescript
/**
 * Deletes session and optionally revokes persistent token
 */
export async function deleteSession(
  sessionId: string | undefined,
  revokePersistent: boolean = false
): Promise<void> {
  if (!sessionId) return;

  const session = sessions.get(sessionId);

  // Revoke persistent token if requested
  if (revokePersistent && session?.persistentTokenId) {
    await revokePersistentToken(session.persistentTokenId, 'User logged out');
  }

  sessions.delete(sessionId);
}
```

### Phase 3: Login Form Updates (1 hour)

#### 3.1 Update Admin Login Page

**File**: `/home/user/chrisrodz.io/src/pages/admin/index.astro`

Add checkbox to form:

```astro
<form method="POST">
  <input type="hidden" name="csrf_token" value={csrfToken} />
  <fieldset disabled={isRateLimited}>
    <label for="password">Admin Password</label>
    <input
      type="password"
      name="password"
      id="password"
      placeholder="Enter admin password"
      required
    />

    <!-- NEW: Remember Me Checkbox -->
    <label>
      <input
        type="checkbox"
        name="remember_me"
        id="remember_me"
        role="switch"
      />
      Remember me for 30 days
    </label>

    <button type="submit">Login</button>
  </fieldset>
</form>
```

#### 3.2 Update Login Handler

Update the POST handler section:

```typescript
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();
  const csrfValidation = validateLoginCsrf(currentSessionId, formData.get('csrf_token'));

  if (!csrfValidation.isValid) {
    // ... existing CSRF error handling
  } else if (!rateLimitState.allowed) {
    // ... existing rate limit handling
  } else {
    const password = formData.get('password') as string;
    const rememberMe = formData.get('remember_me') === 'on';

    if (verifyAdminSecret(password)) {
      resetRateLimit(rateLimitKey);
      deleteSession(currentSessionId);

      if (rememberMe) {
        // Create persistent session
        const userAgent = Astro.request.headers.get('user-agent') || undefined;
        const ipAddress = getClientIdentifier().replace(/^ip:/, '');

        const result = await createPersistentSession({
          userAgent,
          ipAddress,
        });

        if (result) {
          setRememberMeCookies(cookies, result.sessionId, result.token);
        } else {
          // Fallback to regular session if DB unavailable
          const sessionId = createSession();
          setAuthCookie(cookies, sessionId);
          console.warn('Created temporary session; persistent sessions unavailable');
        }
      } else {
        // Create regular temporary session
        const sessionId = createSession();
        setAuthCookie(cookies, sessionId);
      }

      return Astro.redirect('/admin/cafe');
    }

    // ... existing failed login handling
  }
}
```

### Phase 4: Logout Updates (30 minutes)

#### 4.1 Update Logout Page

**File**: `/home/user/chrisrodz.io/src/pages/admin/logout.astro`

```typescript
const cookies = Astro.cookies;
const sessionId = cookies.get('session_id')?.value ?? undefined;

// Delete session and revoke persistent token
await deleteSession(sessionId, true); // true = revoke persistent token
clearAllAuthCookies(cookies);

return Astro.redirect('/admin?logout=success');
```

### Phase 5: Protected Routes Updates (1 hour)

Update all protected pages to handle async `checkAuth`:

**Example**: `/home/user/chrisrodz.io/src/pages/admin/cafe/index.astro`

```typescript
// OLD (synchronous)
const isAuthed = checkAuth(Astro.cookies);

// NEW (async)
const isAuthed = await checkAuth(Astro.cookies);
```

Search and replace across all admin pages:
- `/src/pages/admin/*.astro`
- Any middleware that calls `checkAuth`

### Phase 6: Session Management Page (Optional, 1 hour)

Create admin page to view and revoke sessions:

**File**: `/home/user/chrisrodz.io/src/pages/admin/sessions.astro`

```astro
---
import Layout from '../../layouts/Layout.astro';
import { checkAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export const prerender = false;

const isAuthed = await checkAuth(Astro.cookies);
if (!isAuthed) {
  return Astro.redirect('/admin');
}

let sessions = [];
let error = '';

if (supabase) {
  const { data, error: fetchError } = await supabase
    .from('persistent_sessions')
    .select('id, created_at, expires_at, last_used_at, user_agent, ip_address, revoked')
    .eq('user_identifier', 'admin')
    .order('created_at', { ascending: false });

  if (fetchError) {
    error = 'Failed to load sessions';
  } else {
    sessions = data || [];
  }
}

// Handle revocation
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();
  const action = formData.get('action');
  const sessionId = formData.get('session_id');

  if (action === 'revoke' && sessionId) {
    const { revokeSessionById } = await import('../../lib/auth');
    await revokeSessionById(sessionId as string);
    return Astro.redirect('/admin/sessions');
  } else if (action === 'revoke_all') {
    const { revokeAllSessions } = await import('../../lib/auth');
    await revokeAllSessions();
    return Astro.redirect('/admin/sessions');
  }
}
---

<Layout title="Session Management">
  <h1>Active Sessions</h1>

  {error && <p style="color: red;">{error}</p>}

  {sessions.length === 0 ? (
    <p>No active sessions</p>
  ) : (
    <table>
      <thead>
        <tr>
          <th>Created</th>
          <th>Last Used</th>
          <th>Expires</th>
          <th>User Agent</th>
          <th>IP</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => (
          <tr>
            <td>{new Date(session.created_at).toLocaleString()}</td>
            <td>{new Date(session.last_used_at).toLocaleString()}</td>
            <td>{new Date(session.expires_at).toLocaleString()}</td>
            <td>{session.user_agent || 'Unknown'}</td>
            <td>{session.ip_address || 'Unknown'}</td>
            <td>{session.revoked ? '❌ Revoked' : '✅ Active'}</td>
            <td>
              {!session.revoked && (
                <form method="POST" style="display: inline;">
                  <input type="hidden" name="action" value="revoke" />
                  <input type="hidden" name="session_id" value={session.id} />
                  <button type="submit" class="secondary">Revoke</button>
                </form>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}

  <form method="POST" style="margin-top: 2rem;">
    <input type="hidden" name="action" value="revoke_all" />
    <button type="submit" class="contrast">Revoke All Sessions</button>
  </form>
</Layout>
```

---

## Pros and Cons

### Pros ✅

1. **Better User Experience**
   - Users can stay logged in for weeks without re-authenticating
   - Reduces friction for frequent admin tasks
   - Familiar pattern ("Remember Me" is industry standard)

2. **Security Advantages**
   - Tokens stored as SHA-256 hashes (not plaintext)
   - Ability to revoke specific sessions remotely
   - Audit trail (IP, user agent, last used)
   - Expired tokens automatically cleaned up
   - Separate cookie for persistent auth (can be revoked independently)

3. **Operational Benefits**
   - Survives server restarts (database-backed)
   - Can view all active sessions
   - Can force logout from all devices
   - Easier debugging (sessions visible in database)

4. **Backwards Compatible**
   - Regular sessions still work
   - Graceful degradation if database unavailable
   - Checkbox is optional (defaults to temporary session)

### Cons ❌

1. **Increased Complexity**
   - Dual cookie system to manage
   - Database dependency for persistent sessions
   - Async auth checks (breaking change)
   - More code to test and maintain

2. **Security Risks**
   - Longer-lived tokens = larger attack window
   - Token theft more impactful (30 days vs 24 hours)
   - Must ensure secure cookies in production
   - Database compromise exposes token hashes

3. **Performance Considerations**
   - Database query on every auth check (if no valid session)
   - Additional database writes on login
   - Cleanup jobs needed for expired tokens

4. **Migration Challenges**
   - All `checkAuth` calls must be updated to `await`
   - Database migration required
   - Need to test migration path thoroughly

---

## Security Considerations

### Token Generation

**Cryptographic Strength**:
- Use `nanoid(64)` for 384 bits of entropy (~64 characters)
- Equivalent to 256-bit security (industry standard)
- Alternative: `crypto.randomBytes(32).toString('base64url')`

**Token Storage**:
- NEVER store tokens in plaintext
- Hash with SHA-256 before database storage
- No need for salt (tokens are already random)
- Token pattern: `<user_id>_<random_bytes>` (optional, for token family tracking)

### Token Rotation

**Current Implementation**: No rotation

**Best Practice Recommendation**: Implement token rotation every N days:

```typescript
async function rotateTokenIfNeeded(tokenId: string, lastRotation: Date) {
  const ROTATION_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

  if (Date.now() - lastRotation.getTime() > ROTATION_INTERVAL) {
    const newToken = generateSecureToken();
    const newHash = hashToken(newToken);

    await supabase
      .from('persistent_sessions')
      .update({
        token_hash: newHash,
        last_rotated_at: new Date().toISOString()
      })
      .eq('id', tokenId);

    return newToken;
  }

  return null;
}
```

**Trade-off**: Adds complexity, but limits token lifetime even if not revoked.

### Cookie Security Settings

**Persistent Token Cookie**:
```typescript
{
  httpOnly: true,        // ✅ Prevents XSS attacks
  secure: true,          // ✅ HTTPS only (production)
  sameSite: 'lax',       // ✅ CSRF protection (or 'strict')
  maxAge: 30 * 86400,    // 30 days
  path: '/',             // Available site-wide
  domain: undefined,     // Same-origin only
}
```

**Security Checklist**:
- ✅ `httpOnly: true` - JavaScript cannot access
- ✅ `secure: true` - Only sent over HTTPS (production)
- ✅ `sameSite: 'lax'` - Prevents most CSRF attacks
- ❌ `sameSite: 'strict'` - More secure, but breaks links from external sites
- ❌ `domain` setting - Never set unless multi-subdomain needed

### Database Security

**Row Level Security (RLS)**:
```sql
-- No public access to persistent_sessions
-- All access via app with service key
alter table persistent_sessions enable row level security;
```

**Application-Level Auth**:
- Use Supabase service key (not anon key) for session operations
- Validate admin secret before creating sessions
- Never expose session tokens in API responses
- Log suspicious activity (multiple failed validations)

### Attack Mitigation

**Token Theft**:
- Limit: Store IP address and user agent
- Monitor: Alert on location/device changes
- Mitigate: Allow user to revoke all sessions
- Expire: 30-day hard limit

**Replay Attacks**:
- Update `last_used_at` on every validation
- Detect: Multiple simultaneous uses from different IPs
- Block: Revoke token if suspicious pattern detected

**Brute Force**:
- Existing rate limiting still applies
- Token validation doesn't bypass rate limits
- Hash comparison is constant-time (SHA-256)

**XSS**:
- HttpOnly cookies prevent JavaScript access
- Content Security Policy blocks inline scripts
- Don't echo token in HTML/logs

**CSRF**:
- SameSite=lax prevents most CSRF
- POST requests still protected by CSRF tokens
- Token cookies not sent cross-origin

---

## Database Schema Changes

### Migration File

**Location**: `/home/user/chrisrodz.io/supabase/migrations/YYYYMMDDHHMMSS_add_persistent_sessions.sql`

**Table Structure**:
```sql
persistent_sessions (
  id                uuid PRIMARY KEY,
  created_at        timestamptz NOT NULL,
  expires_at        timestamptz NOT NULL,
  last_used_at      timestamptz NOT NULL,
  token_hash        text UNIQUE NOT NULL,
  user_identifier   text NOT NULL DEFAULT 'admin',
  user_agent        text NULL,
  ip_address        text NULL,
  revoked           boolean NOT NULL DEFAULT false,
  revoked_at        timestamptz NULL,
  revocation_reason text NULL
)
```

**Indexes**:
1. `token_hash` (unique) - Fast lookups
2. `expires_at` - Cleanup queries
3. `user_identifier` - Multi-user support
4. Partial index on active sessions only

**Storage Estimate**:
- ~500 bytes per row
- 1000 sessions = ~500 KB
- Negligible storage impact

**Cleanup Strategy**:
```sql
-- Manual cleanup
DELETE FROM persistent_sessions
WHERE expires_at < now() - interval '30 days';

-- Automated cleanup (requires pg_cron)
SELECT cron.schedule(
  'cleanup-expired-sessions',
  '0 2 * * *', -- 2 AM daily
  'SELECT cleanup_expired_sessions()'
);
```

### TypeScript Types

After running `yarn db:types`, you'll get:

```typescript
export interface Database {
  public: {
    Tables: {
      persistent_sessions: {
        Row: {
          id: string;
          created_at: string;
          expires_at: string;
          last_used_at: string;
          token_hash: string;
          user_identifier: string;
          user_agent: string | null;
          ip_address: string | null;
          revoked: boolean;
          revoked_at: string | null;
          revocation_reason: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          expires_at: string;
          last_used_at?: string;
          token_hash: string;
          user_identifier?: string;
          user_agent?: string | null;
          ip_address?: string | null;
          revoked?: boolean;
          revoked_at?: string | null;
          revocation_reason?: string | null;
        };
        Update: {
          // ... similar to Insert
        };
      };
    };
  };
}
```

---

## Cookie Security Settings

### Comparison: Temporary vs. Persistent

| Setting | Temporary Session | Persistent Session | Rationale |
|---------|------------------|-------------------|-----------|
| **Name** | `session_id` | `remember_token` | Different purposes |
| **HttpOnly** | `true` | `true` | XSS protection |
| **Secure** | `prod only` | `prod only` | HTTPS enforcement |
| **SameSite** | `lax` | `lax` | CSRF protection |
| **MaxAge** | 86,400s (24h) | 2,592,000s (30d) | Different lifetimes |
| **Path** | `/` | `/` | Site-wide |
| **Domain** | (none) | (none) | Same-origin only |

### Production Checklist

Before deploying to production:

- [ ] Verify `config.env.isProd` is `true` in production
- [ ] Confirm HTTPS is enforced (Vercel does this automatically)
- [ ] Test cookies are not sent over HTTP
- [ ] Verify `Secure` flag is set on cookies
- [ ] Check security headers are applied (middleware)
- [ ] Confirm Content-Security-Policy allows cookies
- [ ] Test SameSite behavior with cross-origin requests
- [ ] Verify HttpOnly flag prevents JavaScript access

### Testing Cookie Security

```bash
# Check cookies in Chrome DevTools
# 1. Open DevTools (F12)
# 2. Application tab > Cookies
# 3. Verify flags: HttpOnly, Secure, SameSite

# Test with curl
curl -v https://chrisrodz.io/admin \
  -c cookies.txt \
  -L

# Check cookie attributes in cookies.txt
cat cookies.txt
```

---

## Best Practices

### 1. Token Lifecycle Management

**Generation**:
- Use cryptographically secure random number generator
- Minimum 256 bits of entropy (384 bits recommended)
- Never reuse tokens, even if expired

**Storage**:
- Hash before storing (SHA-256 minimum)
- Store hash, not plaintext
- No need for salt (tokens are already random)
- Consider adding metadata (created_at, last_used_at)

**Validation**:
- Constant-time comparison (timing attack prevention)
- Check expiration before hash comparison
- Check revocation status
- Update last_used_at timestamp
- Rate limit validation attempts

**Revocation**:
- Soft delete (mark as revoked, don't delete row)
- Log revocation reason
- Provide "revoke all" functionality
- Keep revoked tokens for audit trail (30-90 days)

### 2. User Communication

**Login Form**:
- Clear explanation: "Remember me for 30 days"
- Warning on shared devices: "Don't check this on shared computers"
- Link to security settings

**Security Settings Page**:
- List all active sessions
- Show last used date, device, location
- "This is me" / "Not me" buttons
- One-click "Log out all other sessions"

**Email Notifications** (optional):
- New device login notification
- "Was this you?" prompt
- Link to revoke session

### 3. Monitoring and Alerting

**Metrics to Track**:
- Number of active persistent sessions
- Session duration (average, median, max)
- Token validation failures
- Revocation rate
- Expired token cleanup frequency

**Alerts**:
- High rate of token validation failures
- Unusual spike in new sessions
- Multiple failed validations for same token
- Sessions from unusual locations (if tracking)

**Logs**:
```typescript
// Log suspicious activity
if (validationAttempts > 3) {
  console.warn({
    event: 'suspicious_token_validation',
    tokenId: hashToken(token).slice(0, 8), // First 8 chars only
    attempts: validationAttempts,
    ip: ipAddress,
  });
}
```

### 4. Graceful Degradation

**Database Unavailable**:
```typescript
if (!supabase) {
  // Fall back to temporary session
  console.warn('Database unavailable, using temporary session');
  const sessionId = createSession();
  setAuthCookie(cookies, sessionId);
  return;
}
```

**Token Validation Failure**:
```typescript
if (!validToken) {
  // Clear invalid cookie
  cookies.delete('remember_token', { path: '/' });
  // Don't throw error, just fall back to login
  return false;
}
```

### 5. Session Hygiene

**Cleanup Schedule**:
- Delete expired tokens: Daily at 2 AM
- Archive old revoked tokens: Monthly
- Alert on orphaned sessions: Weekly

**Limits**:
- Maximum 5 active sessions per user
- When creating 6th, revoke oldest
- Prevents unlimited token accumulation

```typescript
async function enforceSessionLimit(userIdentifier: string, limit: number = 5) {
  const { data } = await supabase
    .from('persistent_sessions')
    .select('id, created_at')
    .eq('user_identifier', userIdentifier)
    .eq('revoked', false)
    .order('created_at', { ascending: true });

  if (data && data.length >= limit) {
    // Revoke oldest sessions
    const toRevoke = data.slice(0, data.length - limit + 1);
    await supabase
      .from('persistent_sessions')
      .update({ revoked: true, revocation_reason: 'Session limit exceeded' })
      .in('id', toRevoke.map(s => s.id));
  }
}
```

---

## Edge Cases and Issues

### 1. Server Restart Handling

**Issue**: In-memory sessions lost on restart, but persistent tokens remain.

**Solution**: Persistent tokens automatically restore sessions on next request.

```typescript
// checkAuth already handles this
const token = getPersistentToken(cookies);
if (token) {
  const sessionId = await validatePersistentToken(token);
  if (sessionId) {
    setAuthCookie(cookies, sessionId);
    return true;
  }
}
```

### 2. Clock Skew

**Issue**: Server clock changes could invalidate timestamps.

**Mitigation**:
- Use UTC timestamps (already doing this)
- Add grace period to expiration checks
- Don't rely solely on expiration for security

```typescript
const GRACE_PERIOD = 5 * 60 * 1000; // 5 minutes

if (expiresAt.getTime() + GRACE_PERIOD < Date.now()) {
  // Expired
}
```

### 3. Concurrent Requests

**Issue**: Multiple simultaneous requests validating same token.

**Mitigation**:
- Database handles concurrent updates safely
- `last_used_at` updates are non-critical (eventual consistency OK)
- Use database transactions for critical updates

### 4. Token in URL

**Issue**: User might accidentally paste token in URL or email.

**Prevention**:
- Never accept tokens via query params
- Only accept in cookies
- Warn users not to share cookies

### 5. Mixed Content (HTTP/HTTPS)

**Issue**: Token sent over HTTP if `secure: false`.

**Prevention**:
- Always set `secure: true` in production
- Vercel enforces HTTPS automatically
- HSTS header prevents HTTP fallback

### 6. Cookie Size Limits

**Issue**: Browsers limit cookie size (4096 bytes total).

**Our Cookies**:
- `session_id`: 32 chars (~32 bytes)
- `remember_token`: 64 chars (~64 bytes)
- Other cookies: ~100 bytes
- **Total**: ~200 bytes ✅ (well under limit)

### 7. Subdomain Isolation

**Issue**: Cookies shared across subdomains if `domain` set.

**Prevention**:
- Don't set `domain` attribute
- Defaults to same-origin only
- Each subdomain gets its own cookies

### 8. Session Fixation

**Issue**: Attacker forces user to use attacker's session ID.

**Mitigation**:
- Regenerate session ID after login (already doing this)
- Delete old session on login
- CSRF protection prevents forced login

```typescript
// On successful login
deleteSession(currentSessionId); // Delete old session
const newSessionId = createSession(); // Generate new ID
```

### 9. Database Migration Rollback

**Issue**: Need to rollback migration.

**Rollback Script**:
```sql
-- down.sql
DROP TABLE IF EXISTS persistent_sessions CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_sessions();
```

### 10. Multi-Tab Logout

**Issue**: Logging out in one tab doesn't affect other tabs immediately.

**Current Behavior**:
- Session cookie deleted
- Other tabs still have cookie
- Next request validates and finds no session
- Tabs show logout after next navigation

**Enhancement** (optional):
- Use Broadcast Channel API to sync logout
- Or poll session status every N seconds

---

## Testing Strategy

### Unit Tests

**File**: `/home/user/chrisrodz.io/src/lib/auth.test.ts`

```typescript
describe('Persistent Sessions', () => {
  describe('Token Generation', () => {
    it('should generate unique tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64);
    });

    it('should hash tokens consistently', () => {
      const token = 'test-token';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64); // SHA-256 = 64 hex chars
    });
  });

  describe('createPersistentSession', () => {
    it('should create session with valid token', async () => {
      const result = await createPersistentSession();
      expect(result).not.toBeNull();
      expect(result?.token).toBeDefined();
      expect(result?.sessionId).toBeDefined();
    });

    it('should return null if database unavailable', async () => {
      // Mock supabase as null
      vi.mock('./supabase', () => ({ supabase: null }));
      const result = await createPersistentSession();
      expect(result).toBeNull();
    });
  });

  describe('validatePersistentToken', () => {
    it('should validate correct token', async () => {
      const { token } = await createPersistentSession();
      const sessionId = await validatePersistentToken(token);
      expect(sessionId).not.toBeNull();
    });

    it('should reject invalid token', async () => {
      const sessionId = await validatePersistentToken('invalid-token');
      expect(sessionId).toBeNull();
    });

    it('should reject expired token', async () => {
      // Create token with past expiration
      // ... test implementation
    });

    it('should reject revoked token', async () => {
      const { token, sessionId } = await createPersistentSession();
      await revokePersistentToken(sessionId);
      const result = await validatePersistentToken(token);
      expect(result).toBeNull();
    });
  });

  describe('Cookie Management', () => {
    it('should set both cookies for remember me', () => {
      const mockCookies = createMockCookies();
      setRememberMeCookies(mockCookies, 'session123', 'token456');

      expect(mockCookies.get('session_id')?.value).toBe('session123');
      expect(mockCookies.get('remember_token')?.value).toBe('token456');
    });

    it('should clear all auth cookies', () => {
      const mockCookies = createMockCookies({
        session_id: 'session123',
        remember_token: 'token456',
      });

      clearAllAuthCookies(mockCookies);

      expect(mockCookies.get('session_id')).toBeUndefined();
      expect(mockCookies.get('remember_token')).toBeUndefined();
    });
  });
});
```

### Integration Tests

**Test Cases**:
1. Login with "Remember Me" checked
2. Login without "Remember Me" checked
3. Token restoration after server restart (simulate)
4. Logout with persistent session
5. Revoke all sessions
6. Expired token handling
7. Invalid token handling

### Manual Testing Checklist

- [ ] Check "Remember Me" creates persistent token in database
- [ ] Verify token cookie has 30-day maxAge
- [ ] Confirm session restored after server restart
- [ ] Test logout revokes persistent token
- [ ] Verify expired tokens are rejected
- [ ] Check revoked tokens are rejected
- [ ] Confirm session hygiene (old tokens cleaned up)
- [ ] Test with database unavailable (graceful degradation)
- [ ] Verify cookies have correct security flags
- [ ] Test cross-browser (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Verify HTTPS enforcement in production

### Security Testing

**Penetration Testing**:
- [ ] Attempt token theft via XSS (should fail - HttpOnly)
- [ ] Attempt CSRF attack (should fail - SameSite)
- [ ] Test replay attack (different IP/device)
- [ ] Brute force token validation (rate limit)
- [ ] SQL injection in token validation (parameterized queries)
- [ ] Session fixation attack (session regeneration)

---

## Rollback Plan

### If Issues Found After Deployment

**Immediate Rollback** (< 5 minutes):

1. Revert login form (remove checkbox):
   ```typescript
   // Remove remember me checkbox from form
   // All logins create temporary sessions only
   ```

2. Disable persistent token validation:
   ```typescript
   export async function checkAuth(cookies: AstroCookies): Promise<boolean> {
     // Comment out persistent token restoration
     // const token = getPersistentToken(cookies);
     // if (token) { ... }

     // Keep only temporary session validation
     const sessionId = cookies.get('session_id')?.value;
     return validateSession(sessionId) && sessions.get(sessionId)?.authenticated === true;
   }
   ```

3. Deploy fix via PR

**Database Rollback** (if needed):

```sql
-- Disable table (keeps data for analysis)
ALTER TABLE persistent_sessions DISABLE TRIGGER ALL;

-- Or drop table (destructive)
DROP TABLE persistent_sessions CASCADE;
```

**Communication**:
- Notify users of temporary session-only mode
- Explain active sessions may require re-login
- Provide timeline for fix

### Monitoring Post-Deploy

**First 24 Hours**:
- Monitor error logs for auth failures
- Check database query performance
- Verify token creation/validation rates
- Watch for unusual patterns

**First Week**:
- Review session duration metrics
- Check token cleanup job
- Analyze revocation patterns
- Gather user feedback

---

## Implementation Timeline

### Total Estimate: 6-8 hours

**Day 1 (4 hours)**:
- Create database migration (1 hour)
- Update auth.ts functions (2 hours)
- Update login form (1 hour)

**Day 2 (3 hours)**:
- Update protected routes (1 hour)
- Add tests (1 hour)
- Manual testing (1 hour)

**Day 3 (1 hour)**:
- Session management page (optional)
- Documentation updates
- Deployment

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Create feature branch**: `feature/remember-me-sessions`
3. **Implement Phase 1**: Database migration
4. **Test migration** on staging database
5. **Implement Phases 2-5**: Code changes
6. **Write tests**: Unit + integration
7. **Manual testing**: All edge cases
8. **Security review**: Penetration testing
9. **Create PR**: Get code review
10. **Deploy to production**: Monitor closely

---

## Additional Resources

**Security Standards**:
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

**Cookie Security**:
- [MDN: Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP: SameSite Cookie Attribute](https://owasp.org/www-community/SameSite)

**Token Design**:
- [RFC 6750: OAuth 2.0 Bearer Token Usage](https://tools.ietf.org/html/rfc6750)
- [OWASP: JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

_Last Updated: 2025-10-25_
_Author: Implementation Plan for APPROACH 2_
_Status: Draft - Ready for Review_
