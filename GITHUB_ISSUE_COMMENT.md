## Implementation Plan - Auto-Tweet Coffee Logs

Based on requirements in #51, here's the detailed implementation plan for automatic Twitter posting when coffee entries are logged.

---

### 🎯 Approach Summary

**Tech Stack Decisions:**
- **Platform:** Twitter API v2 (direct integration)
- **Messages:** AI-generated via Claude API (contextual, creative)
- **Screenshots:** Puppeteer (server-side capture of `/cafe` hero section)
- **User Control:** Checkbox toggle (default: checked)
- **Performance:** Async edge function (non-blocking, fast UX)

---

### 🏗️ Architecture

```
User submits form → DB insert (fast) → User redirected ✅
                         ↓
                  Async background job:
                  1. Generate AI message (Claude API)
                  2. Capture screenshot (Puppeteer)
                  3. Post to Twitter (v2 API)
```

**User Experience:**
- Form submission: < 200ms (no slowdown)
- Tweet appears: ~10-15 seconds later (background)
- Graceful degradation if APIs unavailable

---

### 📦 New Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.32.0",
  "twitter-api-v2": "^1.18.2",
  "puppeteer-core": "^23.10.0",
  "@sparticuz/chromium": "^131.0.0"
}
```

---

### 🔐 Environment Variables

```bash
# Twitter (OAuth 1.0a)
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=

# Claude API
ANTHROPIC_API_KEY=

# Site config
SITE_URL=https://chrisrodz.io
```

---

### 📂 Files to Create

1. **`/src/lib/twitter.ts`** - Twitter API client wrapper
2. **`/src/lib/ai-message-generator.ts`** - Claude API wrapper for message generation
3. **`/src/lib/screenshot.ts`** - Puppeteer screenshot capture
4. **`/src/pages/api/social/post-coffee.ts`** - Async endpoint (main workflow)
5. **`/vercel.json`** - Configure function timeout (30s for Puppeteer)

---

### ✏️ Files to Modify

1. **`/src/components/cafe/CoffeeLogForm.tsx`**
   - Add: `shareOnSocial` state (default: `true`)
   - Add: Checkbox after Notes field
   - Add: `share_on_social` to formData

2. **`/src/pages/admin/cafe.astro`**
   - After DB insert, trigger async POST to `/api/social/post-coffee`
   - Fire-and-forget (don't block redirect)

3. **`/.env.example`**
   - Add Twitter + Anthropic env var documentation

4. **`/src/i18n/es.json` & `/src/i18n/en.json`**
   - Add: `cafe.form.shareOnSocial` translation keys

5. **`/package.json`**
   - Add new dependencies

---

### 🧪 Testing Plan

**Manual Testing:**
- [ ] Submit form with checkbox checked → verify tweet appears
- [ ] Submit form with checkbox unchecked → verify no tweet
- [ ] Verify screenshot shows correct "Today's Coffee" card
- [ ] Verify AI message is contextual and creative
- [ ] Test graceful degradation (missing env vars)

**Edge Cases:**
- [ ] Missing Twitter credentials (silent fail, logs error)
- [ ] Missing Anthropic key (silent fail, logs error)
- [ ] Screenshot timeout (doesn't crash form submission)

---

### 🚀 Deployment Steps

1. **Twitter Developer Setup:**
   - Create app at https://developer.twitter.com/en/portal/dashboard
   - Enable OAuth 1.0a with "Read and Write" permissions
   - Generate API keys + Access tokens

2. **Anthropic Setup:**
   - Get API key from https://console.anthropic.com/settings/keys

3. **Vercel:**
   - Add all env vars to Vercel dashboard
   - Deploy to production

4. **Test:**
   - Log a coffee in production
   - Verify tweet appears on Twitter within 30 seconds

---

### 📊 Performance

| Operation | Duration | User Impact |
|-----------|----------|-------------|
| Form submission + redirect | ~200ms | ✅ User waits |
| **Background (async)** | | |
| Claude API | ~1-2s | ❌ User doesn't wait |
| Puppeteer screenshot | ~5-8s | ❌ User doesn't wait |
| Twitter post | ~2-3s | ❌ User doesn't wait |
| **Total background** | **~10-15s** | **Tweet appears automatically** |

---

### 💰 Cost Estimate

- **Claude API:** ~$0.003 per post
- **Twitter API:** Free tier (50 tweets/day)
- **Puppeteer:** Free (Vercel serverless)

**Total:** ~$0.09/month (30 coffees/month)

---

### ✅ Implementation Checklist

**Phase 1: Core Infrastructure**
- [ ] Install dependencies
- [ ] Create Twitter client (`/src/lib/twitter.ts`)
- [ ] Create AI message generator (`/src/lib/ai-message-generator.ts`)
- [ ] Create screenshot utility (`/src/lib/screenshot.ts`)
- [ ] Create API endpoint (`/src/pages/api/social/post-coffee.ts`)
- [ ] Create Vercel config (`/vercel.json`)

**Phase 2: UI Integration**
- [ ] Add checkbox to `CoffeeLogForm.tsx`
- [ ] Trigger async post in `/admin/cafe.astro`
- [ ] Add i18n translations

**Phase 3: Testing & Deployment**
- [ ] Local testing with test Twitter account
- [ ] Set up production Twitter app
- [ ] Configure Vercel env vars
- [ ] Deploy and monitor first production post

---

### 🔮 Future Enhancements (Out of Scope)

- Bluesky/Mastodon integration
- Template-based messages (fallback if no Claude API)
- Post history tracking
- Edit/delete tweets from admin
- Scheduled posting

---

**Estimated Time:** 6-8 hours (implementation + testing)

Full implementation details available in `/IMPLEMENTATION_PLAN_ISSUE_51.md`

Ready to start? 🚀☕
