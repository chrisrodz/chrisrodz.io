#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the post title from command line arguments
const postTitle = process.argv[2];

if (!postTitle) {
  console.error('Please provide a post title:');
  console.error('npm run new-post "My New Post Title"');
  process.exit(1);
}

// Generate slug from title
const slug = postTitle
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim('-');

// Get current date
const now = new Date();
const pubDate = now.toISOString().split('T')[0];

// Create the frontmatter
const frontmatter = `---
title: '${postTitle}'
description: 'A brief description of the post'
pubDate: ${pubDate}
tags: []
---

# ${postTitle}

Your content goes here...
`;

// Create the file path
const postsDir = path.join(__dirname, '..', 'src', 'content', 'blog');
const filePath = path.join(postsDir, `${slug}.md`);

// Ensure the directory exists
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// Check if file already exists
if (fs.existsSync(filePath)) {
  console.error(`Error: Post "${slug}.md" already exists!`);
  process.exit(1);
}

// Write the file
fs.writeFileSync(filePath, frontmatter);

console.log(`✅ New post created: ${filePath}`);
console.log(`📝 Edit your post and update the description and tags!`);