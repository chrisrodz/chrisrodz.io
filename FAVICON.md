# Favicon Setup Instructions

A temporary placeholder favicon has been added to `/public/favicon.svg`.

## How to Replace with Your Custom Favicon

### Option 1: Use Favicon.io (Recommended - Easiest)
1. Go to https://favicon.io/
2. Choose your preferred method:
   - **From Text**: Generate from your initials "CR"
   - **From Image**: Upload your own logo
   - **From Emoji**: Pick an emoji that represents you
3. Download the generated files
4. Replace `/public/favicon.svg` and `/public/favicon.png` with your new files

### Option 2: Use RealFaviconGenerator (Most Comprehensive)
1. Go to https://realfavicongenerator.net/
2. Upload your logo/image (PNG, JPG, or SVG)
3. Customize for different platforms (iOS, Android, etc.)
4. Download the generated package
5. Extract and copy all files to `/public/` directory
6. Update `src/layouts/Layout.astro` head section with the provided HTML code

### Option 3: Design in Canva
1. Go to https://www.canva.com/
2. Create a new design (512x512px recommended)
3. Design your favicon
4. Export as PNG
5. Convert to other formats using Favicon.io or RealFaviconGenerator
6. Replace files in `/public/` directory

## Current Placeholder

The current placeholder uses your initials "CR" in white text on a teal background. It's a simple SVG that works well as a temporary solution.

## Recommended Sizes

For best compatibility across all devices and browsers:
- **favicon.svg**: Vector format (preferred for modern browsers)
- **favicon.png**: 32x32px (fallback for older browsers)
- **apple-touch-icon.png**: 180x180px (for iOS home screen)
- **favicon-192.png**: 192x192px (for Android)
- **favicon-512.png**: 512x512px (for high-res displays)

The HTML in `Layout.astro` currently references:
- `/favicon.svg` (primary)
- `/favicon.png` (fallback)

You can add more sizes and platform-specific icons as needed.
