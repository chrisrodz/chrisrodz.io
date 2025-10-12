---
title: 'Website Tech Stack'
description: 'The technical and not so technical decisions I took to create this site'
slug: 'website-tech-stack'
pubDate: 2025-10-13
locale: en
tags: ['web development', 'ai', 'astro', 'personal']
---

# Website Tech Stack

## Introduction

[Expand on why you decided to build a personal website and what you hoped to achieve with it]

## Choosing the Tech Stack

**Key decisions:**

- **Astro v5** for SSR and content-first architecture
- **PicoCSS** for semantic, accessible styling with minimal overhead
- **Supabase** for backend features (coffee tracking, training logs)
- **Vercel** for seamless deployment with auto-deploys from main branch

[Expand on why these technologies made sense for your use case - performance, developer experience, etc.]

## The Development Process with Claude Code

### Initial Setup and Architecture

[Describe how Claude helped set up the initial project structure, configuration files, and key architectural decisions]

**What worked well:**

- Rapid prototyping of page layouts
- Setting up SSR patterns correctly from the start
- Implementing i18n support for English and Spanish

### Building Content Collections

[Talk about implementing the blog system with Astro Content Collections, the folder-based translation structure, and how Claude helped navigate the documentation]

**Key learning:** Understanding the difference between static generation and SSR in Astro v5 was crucial for dynamic routes.

### Adding Interactive Features

[Discuss implementing the coffee tracking system, training logs, or other interactive features]

**Collaboration pattern:** I'd describe what I wanted, Claude would propose solutions, and we'd iterate based on testing and my feedback.

### Styling and Design Decisions

[Talk about choosing PicoCSS, implementing dark mode, and maintaining WCAG compliance]

**Philosophy:** Semantic HTML first, progressive enhancement, respect user preferences (dark mode, reduced motion, etc.)

### Deployment and Iteration

[Describe the deployment process to Vercel, setting up environment variables, and the feedback loop of making improvements]

## Lessons Learned

### What Claude Code Excelled At

- Generating boilerplate and repetitive code
- Explaining complex concepts (SSR vs SSG, Content Collections API)
- Catching mistakes early (type errors, validation gaps)
- Suggesting best practices (security patterns, accessibility)

### What Required Human Judgment

- Design decisions and visual aesthetics
- Content strategy and information architecture
- Balancing features vs simplicity
- Personal voice and writing style

### Development Workflow Insights

[Share insights about the branch workflow, PR process, testing locally, etc.]

## Future Plans

[Mention features you want to add, improvements you're considering, or experiments you want to try]

## Final Thoughts

[Reflect on the experience of building with an AI coding assistant - what surprised you, what you'd do differently next time, and advice for others considering a similar approach]

---

**Tech Stack:** Astro v5, TypeScript, PicoCSS, Tailwind CSS, Supabase, Vercel

**Source Code:** [Link to your GitHub repo if public]
