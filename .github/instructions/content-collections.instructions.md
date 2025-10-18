applyTo:

- "src/content/\*_/_.md"
- "src/content/\*_/_.ts"

---

# Content Collections Instructions

## Blog Post Structure

- Use folder structure: `blog/post-folder/{en,es}.md`
- Include proper frontmatter with required fields
- Use custom `slug` field for URL routing
- Include `locale` field for language detection

## Frontmatter Requirements

```yaml
---
title: 'Post Title'
description: 'Post description'
pubDate: 2025-10-18
slug: 'custom-url-slug'
locale: 'en' # or "es"
tags: ['tag1', 'tag2']
draft: false
---
```

## Content Guidelines

- Use semantic Markdown structure
- Include alt text for images
- Keep content focused and well-organized
- Use proper heading hierarchy (h2, h3, etc.)

## Translation Consistency

- Maintain consistent messaging between languages
- Use similar structure in both language versions
- Keep slugs language-appropriate but recognizable

## Content Collection Config

- Define proper schemas in `src/content/config.ts`
- Use Zod for frontmatter validation
- Include all required fields

## Example Blog Post

```markdown
---
title: 'Hello World'
description: 'Welcome to my new website'
pubDate: 2025-10-18
slug: 'hello-world'
locale: 'en'
tags: ['blog', 'welcome']
draft: false
---

# Hello World

Welcome to my personal website! This is where I'll be sharing thoughts about software engineering, life lessons, and whatever else seems worth sharing.

## What to Expect

You can expect posts about:

- Software development best practices
- Personal experiences and lessons learned
- Technical tutorials and tips

Stay tuned for more content!
```
