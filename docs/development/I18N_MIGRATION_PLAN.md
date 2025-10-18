# i18n Migration Plan: Spanish Default + Enhanced Translation System

## Overview

This document outlines the complete implementation plan to:

1. Switch the site default language from English to Spanish
2. Integrate Astro's built-in i18n for routing
3. Enhance the custom translation system with type safety and validation
4. Consolidate duplicate pages into single files with locale detection
5. Extract all hardcoded text to JSON translation files

**Target:** Create a feature branch with all changes implemented and tested.

**Success Criteria:**

- Spanish is the default language (no prefix: `/`)
- English uses `/en/` prefix
- All hardcoded text extracted to JSON files
- Type-safe translation keys with autocomplete
- Validation script ensures translation completeness
- All tests pass and site works correctly

---

_Note: For the full detailed implementation plan, see the original I18N_MIGRATION_PLAN.md file at the repository root. This is a reference document for the consolidated docs structure._

---

**Last updated**: 2025-10-14
