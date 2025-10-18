# Cafe Page Redesign - Implementation Plan

## Overview

Transform `src/pages/cafe.astro` from a basic data table into an engaging, personal coffee journal that tells the story of my espresso journey.

## Layout Structure (Top to Bottom)

```
┌─────────────────────────────────────┐
│  1. WHY I'M TRACKING THIS           │  <- Short personal blurb
├─────────────────────────────────────┤
│  2. TODAY'S COFFEE                  │  <- Hero card showing today's brews
├─────────────────────────────────────┤
│  3. HERO STATS (3 cards)            │  <- Total, avg rating, avg dose
├─────────────────────────────────────┤
│  4. MY SETUP                        │  <- Equipment info
├─────────────────────────────────────┤
│  5. BREW METHOD DISTRIBUTION        │  <- Visual bar chart
├─────────────────────────────────────┤
│  6. RECENT LOGS TABLE               │  <- Existing table (keep as is)
└─────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Layout Structure & "Why I'm Tracking This"

- Create main layout structure
- Add "Why I'm Tracking This" section with coffee-themed styling
- Set up spacing and responsive containers

### Phase 2: "Today's Coffee" Hero Card

- Query today's coffee logs
- Build hero card component
- Handle empty state
- Show multiple coffees if logged
- Calculate and display ratios

### Phase 3: Hero Stats Cards

- Query aggregate statistics
- Build 3-card responsive grid
- Display total logs, average rating, average dose
- Style with icons/emojis

### Phase 4: "My Setup" Section

- Add equipment information card
- Keep it simple and informative

### Phase 5: Brew Method Distribution (Visual Bar Chart)

- Query brew method counts
- Build horizontal bar chart with CSS
- Calculate percentages
- Show all methods (even if 0 count)

### Phase 6: Mobile Responsiveness & Polish

- Test on mobile (375px)
- Test on tablet (768px)
- Test on desktop (1024px+)
- Adjust spacing, typography, touch targets
- Final visual polish

## Database Queries Needed

### 1. Today's Coffee

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);
const { data: todaysCoffee } = await supabase
  .from('coffee_logs')
  .select('*, coffee_beans(*)')
  .gte('brew_time', today.toISOString())
  .order('brew_time', { ascending: false });
```

### 2. Hero Stats

```typescript
// Total count
const { count: totalLogs } = await supabase
  .from('coffee_logs')
  .select('*', { count: 'exact', head: true });

// Average rating
const { data: ratings } = await supabase.from('coffee_logs').select('quality_rating');
const avgRating = ratings.reduce((sum, r) => sum + r.quality_rating, 0) / ratings.length;

// Average dose
const { data: doses } = await supabase.from('coffee_logs').select('dose_grams');
const avgDose = doses.reduce((sum, d) => sum + d.dose_grams, 0) / doses.length;
```

### 3. Brew Method Distribution

```typescript
const { data: methodCounts } = await supabase.from('coffee_logs').select('brew_method');
// Group and count in JavaScript
```

## Design Specifications

### Color Palette

- Background: Warm neutrals (#FDF8F3, #F5F1ED)
- Primary accent: Coffee brown (#6F4E37)
- Text: Dark brown/near black for contrast
- Cards: White or very light cream with subtle shadows

### Typography

- Headings: Pico CSS serif font (Crimson Text)
- Body: Pico CSS sans-serif (Inter)
- Numbers/stats: Bold weight, larger size

### Spacing

- Sections: 3rem vertical gap on desktop, 2rem on mobile
- Card padding: 2rem on desktop, 1.5rem on mobile
- Inner spacing: 1rem between elements

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Testing Checklist

- [ ] Page looks good on mobile (375px width)
- [ ] Page looks good on tablet (768px width)
- [ ] Page looks good on desktop (1024px+ width)
- [ ] "Today's coffee" shows correctly when there's data
- [ ] "Today's coffee" shows empty state when no data
- [ ] Multiple coffees today display correctly stacked
- [ ] Hero stats calculate correctly
- [ ] Brew method bars show correct percentages
- [ ] All cards have consistent spacing
- [ ] Text is readable with good contrast
- [ ] Dark mode works (if site supports it)

## Notes

- Keep existing table at the bottom
- Use Pico CSS variables for consistency
- Handle missing data gracefully
- Maintain "building in public" vibe
