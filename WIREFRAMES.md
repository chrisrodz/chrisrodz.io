# Homepage Redesign Wireframes

## Current Issues
- Hero section feels too promotional with CTA buttons
- Blog cards have heavy borders and shadows (not minimal)
- No personality or categorization of content
- Footer is centered and generic

## Design Goals
- Typography-first, minimal aesthetic
- Text-focused content presentation
- Add personality through content organization
- Cleaner navigation with underline on hover/active

---

## Option A: Category-Based Layout (Julia Evans Style)

```
┌─────────────────────────────────────────────────────┐
│  Christian Rodriguez                                │
│  ─────────────────────────────────────────────────  │
│  Home  Blog  About            🌙  🇵🇷 ES            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                       │
│              Hey! I'm Christian.                      │
│                                                       │
│  Software Engineer • Triathlete • Dad                │
│                                                       │
│  I write about code, training, and life.             │
│                                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                       │
│  Engineering                                          │
│  ────────────                                         │
│  • Building scalable systems with TypeScript          │
│  • My journey into Astro and SSR                     │
│  • Web performance tips I actually use               │
│                                                       │
│  Triathlon & Training                                 │
│  ─────────────────────                               │
│  • Training for my first Ironman                      │
│  • Recovery tips that worked for me                  │
│                                                       │
│  Coffee & Life                                        │
│  ──────────────                                       │
│  • Perfect pour-over technique                        │
│  • Being a dev dad                                    │
│                                                       │
│  View all posts →                                     │
│                                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ────────────────────────────────────────────────── │
│  © 2025 Christian Rodriguez                          │
│  RSS • Email • GitHub                                │
└─────────────────────────────────────────────────────┘
```

### Benefits
- Immediately shows content variety
- Easy to scan and find topics of interest
- Adds personality through categorization
- Less intimidating than a wall of posts

### Implementation
- Add `category` field to blog frontmatter
- Group posts by category on homepage
- Show 3-4 most recent per category
- Minimal list style (no cards)

---

## Option B: Chronological List (Sean Goedecke / Minimal Style)

```
┌─────────────────────────────────────────────────────┐
│  Christian Rodriguez                                │
│  ─────────────────────────────────────────────────  │
│  Home  Blog  About            🌙  🇵🇷 ES            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                       │
│              Christian Rodriguez                      │
│                                                       │
│  Software Engineer • Triathlete • Dad                │
│                                                       │
│  I write about software engineering, triathlon       │
│  training, and life. Here's what I've been           │
│  working on lately:                                   │
│                                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                       │
│  Oct 2025    Building scalable systems               engineering│
│              with TypeScript                                     │
│                                                                  │
│  Sep 2025    Training for my first Ironman          triathlon   │
│                                                                  │
│  Sep 2025    My journey into Astro and SSR          engineering │
│                                                                  │
│  Aug 2025    Perfect pour-over technique            coffee      │
│                                                                  │
│  ─────────────────────────────────────────────────────────── │
│                                                                  │
│  View all posts →                                                │
│                                                                  │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ────────────────────────────────────────────────── │
│  © 2025 Christian Rodriguez                          │
│  RSS • Email • GitHub                                │
└─────────────────────────────────────────────────────┘
```

### Benefits
- Ultra-minimal, text-focused
- Shows posting frequency
- Tags provide context without being intrusive
- Monospace dates create visual rhythm

### Implementation
- Remove blog cards entirely
- Use `<ul>` with semantic markup
- Monospace font for dates
- Small tags/categories on the right
- Border-bottom on hover only

---

## Option C: Hybrid "Now" Page Approach

```
┌─────────────────────────────────────────────────────┐
│  Christian Rodriguez                                │
│  ─────────────────────────────────────────────────  │
│  Home  Blog  About  Now       🌙  🇵🇷 ES            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                       │
│              Hey! I'm Christian.                      │
│                                                       │
│  Software Engineer • Triathlete • Dad                │
│                                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Currently                                            │
│  ─────────                                            │
│                                                       │
│  🏃 Training for Ironman 70.3 Puerto Rico            │
│  💻 Building with Astro v5 and loving it             │
│  ☕ Experimenting with light roast Guatemalan         │
│                                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Recent Writing                                       │
│  ───────────────                                      │
│                                                       │
│  Building scalable systems with TypeScript            │
│  Oct 2025 • 5 min read                               │
│                                                       │
│  Training for my first Ironman                        │
│  Sep 2025 • 3 min read                               │
│                                                       │
│  View all posts →                                     │
│                                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ────────────────────────────────────────────────── │
│  © 2025 • RSS • Email • GitHub                       │
└─────────────────────────────────────────────────────┘
```

### Benefits
- Shows personality immediately
- "Currently" section keeps content fresh
- Minimal post list below
- Invites people to come back for updates

### Implementation
- Add "Now" page to navigation
- Create "Currently" section (manually updated)
- Minimal post list (no descriptions)
- Add read time estimates

---

## Recommended Approach: Option B with "Now" Elements

**Why?**
- Most minimal and text-focused
- Easiest to implement (uses existing data)
- Can add "Currently" section later
- Scales well as content grows
- Looks professional and readable

**Next Steps:**
1. Implement minimal list style (Option B)
2. Add category tags to blog schema
3. Create simple "Currently" component
4. Consider adding "Now" page in future

---

## Typography & Spacing Details

### Fonts Applied
- **Headings:** Crimson Text (serif) - 600/700 weight
- **Body:** Inter (sans-serif) - 400/500/600 weight
- **Dates/Code:** JetBrains Mono (monospace)

### Color Palette
- **Primary:** Teal (#0891b2) - links, accents
- **Warm Accent:** Coral (#ff6b6b) - special highlights
- **Text:** PicoCSS defaults (responsive to dark mode)

### Key Spacing
- Container max: 720px
- Post list padding: 1.5rem vertical
- Border: 1px bottom only (no cards)
- Navigation: 2px border, underline on active

---

## Navigation Refinements

```
Before:
┌──────────────────────────────────────────────────────┐
│  Christian Rodriguez    Home  Blog  About  🌙  🇵🇷 ES │
│  (gradient text)        (small, muted)                │
└──────────────────────────────────────────────────────┘

After:
┌──────────────────────────────────────────────────────┐
│  Christian Rodriguez    Home  Blog  About  🌙  🇵🇷 ES │
│  (serif, larger)        ────                          │
│                         (underline on active)         │
└──────────────────────────────────────────────────────┘
```

### Changes Made
- ✅ Name uses Crimson Text serif (personality)
- ✅ Removed gradient effect (cleaner)
- ✅ Larger font size for nav links (1rem vs 0.9375rem)
- ✅ Border-bottom on hover/active (subtle)
- ✅ Thicker bottom border (2px vs 1px)

---

## Blog Card Transformation

```
Before (Card Style):
┌─────────────────────────────────────────────┐
│                                             │
│  Oct 15, 2025                               │
│                                             │
│  Building Scalable Systems                  │
│                                             │
│  Learn how to build systems that scale...   │
│                                             │
│  Read more →                                │
│                                             │
└─────────────────────────────────────────────┘
[border, shadow, hover transform]

After (Minimal List):
  Oct 2025    Building Scalable Systems         engineering
  ────────────────────────────────────────────────────────
```

### Changes Made
- ✅ Removed card borders and shadows
- ✅ Border-bottom only (1px)
- ✅ No background color (transparent)
- ✅ No hover transform
- ✅ Serif font for titles
- ✅ Monospace for dates
- ✅ Inline category tags
