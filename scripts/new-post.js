#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the post title from command line arguments
const postTitle = process.argv[2];
const locale = process.argv[3] || 'both'; // 'en', 'es', or 'both'

if (!postTitle) {
  console.error('Please provide a post title:');
  console.error('  yarn new-post "My New Post Title" [locale]');
  console.error('');
  console.error('Examples:');
  console.error('  yarn new-post "My Post"          # Creates both en.md and es.md');
  console.error('  yarn new-post "My Post" en       # Creates only en.md');
  console.error('  yarn new-post "My Post" es       # Creates only es.md');
  process.exit(1);
}

if (!['en', 'es', 'both'].includes(locale)) {
  console.error('Locale must be "en", "es", or "both"');
  process.exit(1);
}

// Generate slug from title (for URL)
const urlSlug = postTitle
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim('-');

// Generate folder name (translation key)
const now = new Date();
const year = now.getFullYear();
const translationKey = `${urlSlug}-${year}`;

// Get current date
const pubDate = now.toISOString().split('T')[0];

// Create the frontmatter template
const createFrontmatter = (lang, title, slug) => `---
title: "${title}"
description: "A brief description of the post"
slug: "${slug}"
pubDate: ${pubDate}
locale: ${lang}
---

# ${title}

Your content goes here...
`;

// Create the post directory
const postsDir = path.join(__dirname, '..', 'src', 'content', 'blog');
const postDir = path.join(postsDir, translationKey);

// Ensure the directory exists
if (!fs.existsSync(postDir)) {
  fs.mkdirSync(postDir, { recursive: true });
  console.log(`📁 Created folder: ${translationKey}/`);
} else {
  console.log(`📁 Using existing folder: ${translationKey}/`);
}

// Create English post
if (locale === 'en' || locale === 'both') {
  const enPath = path.join(postDir, 'en.md');
  if (fs.existsSync(enPath)) {
    console.error(`Error: English post already exists at ${enPath}`);
  } else {
    fs.writeFileSync(enPath, createFrontmatter('en', postTitle, urlSlug));
    console.log(`✅ Created: ${translationKey}/en.md`);
  }
}

// Create Spanish post
if (locale === 'es' || locale === 'both') {
  const esPath = path.join(postDir, 'es.md');
  if (fs.existsSync(esPath)) {
    console.error(`Error: Spanish post already exists at ${esPath}`);
  } else {
    fs.writeFileSync(esPath, createFrontmatter('es', postTitle, urlSlug));
    console.log(`✅ Created: ${translationKey}/es.md`);
  }
}

console.log('');
console.log('📝 Next steps:');
console.log(`  1. Update the title, description, and slug in the frontmatter`);
console.log(`  2. Write your content`);
