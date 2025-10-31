# Implementation Plan: Automatic Twitter Post for Coffee Logs

**Issue:** #51
**Feature:** Auto-post to Twitter when coffee is logged via admin form
**Approved Approach:** Direct Twitter API v2, AI-generated messages (Claude API), Puppeteer screenshots, async edge function

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  User submits coffee log via /admin/cafe                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  POST handler in /admin/cafe.astro                          │
│  - Validates data with Zod (existing)                       │
│  - Inserts to Supabase coffee_logs table (existing)         │
│  - Checks if "share_on_social" checkbox = true (NEW)        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼  (if sharing enabled)
┌─────────────────────────────────────────────────────────────┐
│  Trigger async API endpoint (non-blocking)                  │
│  POST /api/social/post-coffee                               │
│  Body: { logId, locale }                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  User redirected to /cafe (sees their new entry)            │
│  ✅ Fast user experience (social posting happens async)      │
└─────────────────────────────────────────────────────────────┘

                     │ (Background job continues)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Social poster workflow (/api/social/post-coffee)           │
│                                                              │
│  1. Fetch coffee log from DB (with bean details)            │
│  2. Generate AI message via Claude API                      │
│     - Input: brew_method, bean_name, rating, notes          │
│     - Output: Creative, contextual tweet                    │
│  3. Generate screenshot via Puppeteer                       │
│     - Visit /cafe page with auth                            │
│     - Wait for "Today's Coffee" section to render           │
│     - Capture hero card (lines 103-196 of cafe.astro)       │
│     - Save as PNG buffer                                    │
│  4. Post to Twitter v2 API                                  │
│     - Upload image as media                                 │
│     - Create tweet with text + media + link                 │
│  5. Return status (success/error)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Specifications

### Twitter API v2 Integration

**Endpoints:**
- **Media Upload:** `POST /2/tweets` with media
- **OAuth 1.0a:** Required for posting (not OAuth 2.0)

**Authentication:**
- Consumer Key (API Key)
- Consumer Secret (API Secret Key)
- Access Token
- Access Token Secret

**Rate Limits:**
- 50 tweets per 24 hours (free tier)
- 1,500 tweets per 24 hours (paid tier)

### Claude API (Anthropic)

**Model:** `claude-3-5-sonnet-20241022` (or latest)
**Endpoint:** `https://api.anthropic.com/v1/messages`
**Rate Limits:** Based on subscription tier
**Cost:** ~$0.003 per message (3k tokens input, 150 tokens output)

### Puppeteer Screenshots

**Runtime:** Vercel Serverless Function with Chromium layer
**Viewport:** 1200x800 (desktop size for hero card)
**Target:** `.todays-coffee-section` element on `/cafe` page
**Format:** PNG, optimized for Twitter (< 5MB)

**Vercel Setup:**
```json
// vercel.json (NEW FILE)
{
  "functions": {
    "api/social/post-coffee.ts": {
      "maxDuration": 30
    }
  }
}
```

---

## 📦 New Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.0",
    "twitter-api-v2": "^1.18.2",
    "puppeteer-core": "^23.10.0",
    "@sparticuz/chromium": "^131.0.0"
  }
}
```

**Why these libraries:**
- `@anthropic-ai/sdk` - Official Claude API client
- `twitter-api-v2` - Well-maintained Twitter v2 API client with OAuth 1.0a
- `puppeteer-core` - Lightweight Puppeteer without bundled Chromium
- `@sparticuz/chromium` - Chromium binary optimized for AWS Lambda/Vercel

---

## 🔐 Environment Variables

Add to `.env.example` and production environment:

```bash
# -----------------------------------------------------------------------------
# Twitter Integration (Optional - enables auto-posting)
# -----------------------------------------------------------------------------
# Get these from: https://developer.twitter.com/en/portal/dashboard
# Required permissions: Read and Write
# App must have OAuth 1.0a enabled
TWITTER_API_KEY=                    # Consumer API Key
TWITTER_API_SECRET=                 # Consumer API Secret Key
TWITTER_ACCESS_TOKEN=               # OAuth Access Token
TWITTER_ACCESS_TOKEN_SECRET=        # OAuth Access Token Secret

# -----------------------------------------------------------------------------
# Claude API (Optional - enables AI message generation)
# -----------------------------------------------------------------------------
# Get from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=                  # Claude API key (starts with sk-ant-)

# -----------------------------------------------------------------------------
# Social Posting Configuration
# -----------------------------------------------------------------------------
SITE_URL=https://chrisrodz.io       # Your production URL (for screenshots)
```

---

## 📂 New Files to Create

### 1. `/src/lib/twitter.ts`

Twitter API client wrapper.

```typescript
import { TwitterApi } from 'twitter-api-v2';

/**
 * Get Twitter client for posting (OAuth 1.0a)
 * Returns null if credentials not configured
 */
export function getTwitterClient(): TwitterApi | null {
  const apiKey = import.meta.env.TWITTER_API_KEY;
  const apiSecret = import.meta.env.TWITTER_API_SECRET;
  const accessToken = import.meta.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = import.meta.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.warn('Twitter credentials not configured');
    return null;
  }

  return new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken,
    accessSecret,
  });
}

/**
 * Post tweet with image
 * @param text - Tweet text (max 280 chars)
 * @param imageBuffer - PNG image buffer
 * @returns Tweet ID or null if failed
 */
export async function postTweet(
  text: string,
  imageBuffer: Buffer
): Promise<string | null> {
  const client = getTwitterClient();
  if (!client) return null;

  try {
    // Upload media
    const mediaId = await client.v1.uploadMedia(imageBuffer, {
      mimeType: 'image/png',
    });

    // Post tweet with media
    const tweet = await client.v2.tweet({
      text,
      media: { media_ids: [mediaId] },
    });

    return tweet.data.id;
  } catch (error) {
    console.error('Failed to post tweet:', error);
    return null;
  }
}
```

---

### 2. `/src/lib/ai-message-generator.ts`

Claude API wrapper for generating contextual coffee messages.

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { CoffeeLogWithBean } from './schemas/cafe';

/**
 * Generate creative tweet message for coffee log using Claude
 * @param log - Coffee log with bean details
 * @param locale - User's locale (es/en)
 * @returns Generated tweet text or null if failed
 */
export async function generateCoffeeMessage(
  log: CoffeeLogWithBean,
  locale: 'es' | 'en'
): Promise<string | null> {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('Anthropic API key not configured');
    return null;
  }

  const anthropic = new Anthropic({ apiKey });

  // Build context for Claude
  const beanName = log.bean?.bean_name || 'unknown bean';
  const roaster = log.bean?.roaster || null;
  const brewMethod = log.brew_method;
  const rating = log.quality_rating;
  const ratio = log.yield_grams
    ? `1:${(log.yield_grams / log.dose_grams).toFixed(1)}`
    : null;
  const notes = log.notes || null;

  const prompt =
    locale === 'es'
      ? `Genera un tweet corto y creativo (máximo 220 caracteres, para dejar espacio al link) sobre esta preparación de café que acabo de registrar:

Método: ${brewMethod}
Grano: ${beanName}${roaster ? ` (${roaster})` : ''}
Calificación: ${rating}/5
${ratio ? `Ratio: ${ratio}` : ''}
${notes ? `Notas: ${notes}` : ''}

Requisitos:
- Tono: Personal, entusiasta, pero no spam
- Si rating es 5: menciona que fue perfecto/"dialed in"
- Si rating < 3: menciona que fue experimento o ajuste
- Incluye emoji de café ☕ pero no abuses de emojis
- NO incluyas hashtags
- NO incluyas el link (se añadirá automáticamente)
- Escribe en primera persona
- Que suene humano y genuino

Responde SOLO con el texto del tweet, sin comillas ni explicaciones.`
      : `Generate a short, creative tweet (max 220 characters, to leave room for link) about this coffee brew I just logged:

Method: ${brewMethod}
Bean: ${beanName}${roaster ? ` (${roaster})` : ''}
Rating: ${rating}/5
${ratio ? `Ratio: ${ratio}` : ''}
${notes ? `Notes: ${notes}` : ''}

Requirements:
- Tone: Personal, enthusiastic, but not spammy
- If rating is 5: mention it was dialed in/perfect
- If rating < 3: mention it was an experiment/adjustment
- Include coffee emoji ☕ but don't overuse emojis
- NO hashtags
- NO link (will be added automatically)
- Write in first person
- Sound human and genuine

Respond ONLY with the tweet text, no quotes or explanations.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      temperature: 0.8, // Higher creativity
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const message = response.content[0];
    if (message.type !== 'text') return null;

    return message.text.trim();
  } catch (error) {
    console.error('Failed to generate AI message:', error);
    return null;
  }
}
```

---

### 3. `/src/lib/screenshot.ts`

Puppeteer wrapper for capturing cafe page screenshots.

```typescript
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

/**
 * Capture screenshot of today's coffee section
 * @param locale - User locale (es/en)
 * @returns PNG buffer or null if failed
 */
export async function captureHeroCard(locale: 'es' | 'en'): Promise<Buffer | null> {
  const siteUrl = import.meta.env.SITE_URL || 'https://chrisrodz.io';
  const cafeUrl = locale === 'en' ? `${siteUrl}/en/cafe` : `${siteUrl}/cafe`;

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to cafe page
    await page.goto(cafeUrl, { waitUntil: 'networkidle0' });

    // Wait for hero section to render
    await page.waitForSelector('.todays-coffee-section', { timeout: 10000 });

    // Capture hero card element
    const element = await page.$('.todays-coffee-section');
    if (!element) {
      throw new Error('Hero section not found');
    }

    const screenshot = await element.screenshot({
      type: 'png',
      encoding: 'binary',
    });

    return screenshot as Buffer;
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}
```

---

### 4. `/src/pages/api/social/post-coffee.ts`

API endpoint for async social posting workflow.

```typescript
import type { APIRoute } from 'astro';
import { getServiceSupabase } from '@/lib/supabase';
import { generateCoffeeMessage } from '@/lib/ai-message-generator';
import { captureHeroCard } from '@/lib/screenshot';
import { postTweet } from '@/lib/twitter';
import type { CoffeeLogWithBean } from '@/lib/schemas/cafe';

export const prerender = false;

/**
 * POST /api/social/post-coffee
 * Async endpoint to generate screenshot + AI message + post to Twitter
 */
export const POST: APIRoute = async ({ request }) => {
  const serviceSupabase = getServiceSupabase();
  if (!serviceSupabase) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { logId, locale } = await request.json();

    if (!logId || !locale) {
      return new Response(JSON.stringify({ error: 'Missing logId or locale' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Fetch coffee log with bean details
    const { data: log, error: fetchError } = await serviceSupabase
      .from('coffee_logs')
      .select('*, bean:coffee_beans(*)')
      .eq('id', logId)
      .single();

    if (fetchError || !log) {
      throw new Error('Coffee log not found');
    }

    const coffeeLog = log as CoffeeLogWithBean;

    // 2. Generate AI message
    const aiMessage = await generateCoffeeMessage(coffeeLog, locale);
    if (!aiMessage) {
      throw new Error('Failed to generate AI message');
    }

    // 3. Append link to website
    const siteUrl = import.meta.env.SITE_URL || 'https://chrisrodz.io';
    const cafeUrl = locale === 'en' ? `${siteUrl}/en/cafe` : `${siteUrl}/cafe`;
    const tweetText = `${aiMessage}\n\n${cafeUrl}`;

    // 4. Capture screenshot
    const screenshot = await captureHeroCard(locale);
    if (!screenshot) {
      throw new Error('Failed to capture screenshot');
    }

    // 5. Post to Twitter
    const tweetId = await postTweet(tweetText, screenshot);
    if (!tweetId) {
      throw new Error('Failed to post to Twitter');
    }

    return new Response(
      JSON.stringify({
        success: true,
        tweetId,
        message: 'Posted to Twitter successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Social posting error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
```

---

### 5. `/vercel.json`

Configure Vercel function timeout for Puppeteer.

```json
{
  "functions": {
    "api/social/post-coffee.ts": {
      "maxDuration": 30
    }
  }
}
```

---

## ✏️ Files to Modify

### 1. `/src/components/cafe/CoffeeLogForm.tsx`

**Add:** Checkbox toggle for "Share on social media"

**Location:** After the "Notes" textarea (line 451), before submit button (line 464)

```tsx
// Add state
const [shareOnSocial, setShareOnSocial] = useState<boolean>(true); // Default: checked

// In form JSX, after Notes field:
<label>
  <input
    type="checkbox"
    checked={shareOnSocial}
    onChange={(e) => setShareOnSocial(e.target.checked)}
  />
  Compartir en redes sociales (Twitter)
</label>

// In handleSubmit, add to formData:
formData.append('share_on_social', shareOnSocial.toString());
```

**Full modification:**

```tsx
// Line 39: Add state
const [shareOnSocial, setShareOnSocial] = useState<boolean>(true);

// Line 184: Add to formData in handleSubmit
if (notes.trim()) formData.append('notes', notes.trim());
formData.append('share_on_social', shareOnSocial.toString()); // NEW

// Line 461: Add checkbox before submit button
</label>

{/* Share on Social Media Toggle */}
<label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
  <input
    type="checkbox"
    checked={shareOnSocial}
    onChange={(e) => setShareOnSocial(e.target.checked)}
    style={{ width: 'auto', margin: 0 }}
  />
  <span>Compartir en redes sociales (Twitter) ☕</span>
</label>

{/* Submit Button */}
<button
```

---

### 2. `/src/pages/admin/cafe.astro`

**Add:** Trigger async social posting after DB insert

**Location:** After successful coffee log insert (line 99), before redirect (line 103)

```typescript
// After: if (error) throw error;
// Before: return Astro.redirect(cafeUrl);

// Check if user wants to share on social
const shareOnSocial = formData.get('share_on_social') === 'true';

if (shareOnSocial) {
  // Get the inserted log ID
  const { data: insertedLog } = await serviceSupabase
    .from('coffee_logs')
    .select('id')
    .eq('brew_time', validatedData.brew_time)
    .single();

  if (insertedLog) {
    // Trigger async social posting (fire-and-forget)
    const siteUrl = import.meta.env.SITE_URL || Astro.url.origin;
    fetch(`${siteUrl}/api/social/post-coffee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logId: insertedLog.id,
        locale,
      }),
    }).catch((err) => {
      // Log error but don't block user redirect
      console.error('Failed to trigger social posting:', err);
    });
  }
}

// Continue with redirect
const cafeUrl = locale === 'en' ? '/en/cafe' : '/cafe';
return Astro.redirect(cafeUrl);
```

**Full modification:**

```typescript
// Line 88-104: Replace insert block
const { data: insertedLog, error } = await serviceSupabase
  .from('coffee_logs')
  .insert({
    brew_method: validatedData.brew_method,
    bean_id: validatedData.bean_id,
    dose_grams: validatedData.dose_grams,
    yield_grams: validatedData.yield_grams,
    grind_setting: validatedData.grind_setting,
    quality_rating: validatedData.quality_rating,
    brew_time: validatedData.brew_time,
    notes: validatedData.notes,
  })
  .select('id')
  .single();

if (error) throw error;

// NEW: Trigger async social posting
const shareOnSocial = formData.get('share_on_social') === 'true';
if (shareOnSocial && insertedLog) {
  const siteUrl = import.meta.env.SITE_URL || Astro.url.origin;
  fetch(`${siteUrl}/api/social/post-coffee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      logId: insertedLog.id,
      locale,
    }),
  }).catch((err) => console.error('Social posting error:', err));
}

// Redirect to cafe page
const cafeUrl = locale === 'en' ? '/en/cafe' : '/cafe';
return Astro.redirect(cafeUrl);
```

---

### 3. `/.env.example`

**Add:** New environment variables section (after Strava section)

```bash
# -----------------------------------------------------------------------------
# Twitter Integration (Optional - enables auto-posting)
# -----------------------------------------------------------------------------
# Required for auto-posting coffee logs to Twitter.
# Get credentials from: https://developer.twitter.com/en/portal/dashboard
#
# Setup steps:
# 1. Create a Twitter Developer account
# 2. Create a new Project and App
# 3. Enable OAuth 1.0a authentication
# 4. Set app permissions to "Read and Write"
# 5. Generate API Key, API Secret, Access Token, Access Token Secret
#
# If not configured, social posting will be silently disabled.
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=

# -----------------------------------------------------------------------------
# Claude API (Optional - enables AI message generation)
# -----------------------------------------------------------------------------
# Required for generating creative coffee post messages.
# Get API key from: https://console.anthropic.com/settings/keys
#
# If not configured, fallback to template-based messages (future feature).
ANTHROPIC_API_KEY=

# -----------------------------------------------------------------------------
# Site Configuration
# -----------------------------------------------------------------------------
# Your production URL (used for screenshots and links in posts)
SITE_URL=https://chrisrodz.io
```

---

### 4. `/package.json`

**Add:** New dependencies and scripts

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.0",
    "twitter-api-v2": "^1.18.2",
    "puppeteer-core": "^23.10.0",
    "@sparticuz/chromium": "^131.0.0"
  },
  "scripts": {
    "test:social": "node scripts/test-social-posting.js"
  }
}
```

---

### 5. `/src/i18n/es.json` & `/src/i18n/en.json`

**Add:** Translation keys for checkbox label

```json
// es.json
{
  "cafe": {
    "form": {
      "shareOnSocial": "Compartir en redes sociales (Twitter)",
      "shareOnSocialHint": "Tu café será publicado automáticamente en Twitter"
    }
  }
}

// en.json
{
  "cafe": {
    "form": {
      "shareOnSocial": "Share on social media (Twitter)",
      "shareOnSocialHint": "Your coffee will be automatically posted to Twitter"
    }
  }
}
```

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] `src/lib/twitter.ts` - Mock Twitter API client
- [ ] `src/lib/ai-message-generator.ts` - Mock Claude API
- [ ] `src/lib/screenshot.ts` - Mock Puppeteer (headless mode)

### Integration Tests

- [ ] POST `/api/social/post-coffee` with valid logId
- [ ] POST `/api/social/post-coffee` with invalid logId (404)
- [ ] POST `/api/social/post-coffee` without env vars (graceful fail)

### Manual Testing

1. **Local Development:**
   ```bash
   # Set .env vars (use test Twitter account)
   yarn dev
   ```

2. **Test Flow:**
   - Log into `/admin/cafe`
   - Fill coffee log form
   - Check "Share on social media" checkbox
   - Submit form
   - Verify redirect to `/cafe` (fast)
   - Check Twitter account for post (within 10-30s)
   - Verify screenshot shows correct data
   - Verify message is creative and contextual

3. **Edge Cases:**
   - [ ] Checkbox unchecked (no post)
   - [ ] Missing Twitter credentials (graceful fail)
   - [ ] Missing Anthropic key (graceful fail)
   - [ ] Network timeout (doesn't block user)
   - [ ] Invalid screenshot (error logged but doesn't crash)

---

## 🚀 Deployment Steps

### 1. Vercel Configuration

**Add environment variables in Vercel dashboard:**

```
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=xxx
TWITTER_ACCESS_TOKEN=xxx
TWITTER_ACCESS_TOKEN_SECRET=xxx
ANTHROPIC_API_KEY=xxx
SITE_URL=https://chrisrodz.io
```

### 2. Twitter Developer Setup

**Create app:** https://developer.twitter.com/en/portal/dashboard

1. Create project: "chrisrodz.io Coffee Logger"
2. Create app: "Coffee Diary Social Poster"
3. Settings → User authentication settings:
   - OAuth 1.0a: ✅ Enabled
   - App permissions: **Read and Write**
4. Keys and tokens:
   - Generate API Key & Secret
   - Generate Access Token & Secret (with write permissions)
5. Copy all 4 credentials to Vercel

### 3. Anthropic API Setup

1. Go to: https://console.anthropic.com/settings/keys
2. Create new API key: "chrisrodz.io Social Poster"
3. Copy key to Vercel
4. Set usage limits (optional): e.g., $10/month cap

### 4. Deploy to Vercel

```bash
git checkout claude/plan-issue-51-xxx
git add .
git commit -m "feat: Add Twitter auto-posting for coffee logs (#51)"
git push -u origin claude/plan-issue-51-xxx
```

Create PR → Merge to main → Auto-deploy

---

## 📊 Performance Considerations

| Operation | Duration | Notes |
|-----------|----------|-------|
| DB Insert | ~50ms | Existing, no change |
| User Redirect | ~100ms | Fast, user sees result immediately |
| **Async Operations** | | |
| Claude API | ~1-2s | Generates message |
| Puppeteer Screenshot | ~5-8s | Launches Chrome, renders page |
| Twitter Upload | ~2-3s | Uploads image + posts tweet |
| **Total Background** | **~10-15s** | **User doesn't wait for this** |

**User experience:** Submit form → See success page in < 200ms
**Tweet appears:** ~10-15 seconds later

---

## 🎯 Success Metrics

- [ ] User can log coffee in < 200ms (no slowdown)
- [ ] Tweet appears within 30 seconds
- [ ] Screenshot shows correct "Today's Coffee" card
- [ ] AI message is creative and contextual
- [ ] Checkbox toggle works (can disable posting)
- [ ] Gracefully degrades if APIs unavailable
- [ ] No errors in production logs

---

## 🔮 Future Enhancements (Out of Scope)

- [ ] Bluesky integration
- [ ] Mastodon integration
- [ ] Template-based messages (fallback if no API key)
- [ ] Post history/log (track which logs were shared)
- [ ] Edit/delete tweets from admin panel
- [ ] Post timing scheduler (e.g., post at 9am)
- [ ] Multiple image carousel (show charts/stats)

---

## 📝 Notes

- **Puppeteer cold starts:** First screenshot may take 10-15s, subsequent are faster (Lambda warm)
- **Rate limits:** Twitter free tier = 50 tweets/day, should be sufficient for personal use
- **Cost estimate:** ~$0.01 per post (Claude API), negligible for personal site
- **Error handling:** All failures are logged but don't block user experience
- **Privacy:** Only posts when checkbox is checked, user has full control

---

## ✅ Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Install dependencies (`yarn add @anthropic-ai/sdk twitter-api-v2 puppeteer-core @sparticuz/chromium`)
- [ ] Create `/src/lib/twitter.ts`
- [ ] Create `/src/lib/ai-message-generator.ts`
- [ ] Create `/src/lib/screenshot.ts`
- [ ] Create `/src/pages/api/social/post-coffee.ts`
- [ ] Create `/vercel.json`
- [ ] Update `.env.example`

### Phase 2: UI Integration
- [ ] Modify `/src/components/cafe/CoffeeLogForm.tsx` (add checkbox)
- [ ] Modify `/src/pages/admin/cafe.astro` (trigger async post)
- [ ] Add i18n keys to `/src/i18n/es.json`
- [ ] Add i18n keys to `/src/i18n/en.json`

### Phase 3: Testing
- [ ] Local testing with test Twitter account
- [ ] Test checkbox toggle (enabled/disabled)
- [ ] Test graceful degradation (missing env vars)
- [ ] Test screenshot quality
- [ ] Test AI message quality

### Phase 4: Deployment
- [ ] Set up Twitter Developer account
- [ ] Configure Twitter app (OAuth 1.0a)
- [ ] Add env vars to Vercel
- [ ] Deploy to production
- [ ] Monitor first production post

### Phase 5: Documentation
- [ ] Update README with social posting feature
- [ ] Document env var setup in .env.example
- [ ] Add troubleshooting guide for common issues

---

**Estimated Implementation Time:** 4-6 hours
**Estimated Testing Time:** 1-2 hours
**Total:** 6-8 hours

**Ready to start implementation?** 🚀
