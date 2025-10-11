# Prettier & ESLint Setup Plan

This document outlines a comprehensive plan to set up Prettier and ESLint for the chrisrodz.io Astro project.

## Overview

**Goal**: Add code formatting (Prettier) and linting (ESLint) to maintain code quality and consistency.

**Branch Name**: `feature/add-prettier-eslint`

**Estimated Time**: 30-45 minutes

---

## Phase 1: Install Dependencies

### Prettier Dependencies

```bash
yarn add -D prettier prettier-plugin-astro
```

**Packages**:
- `prettier` - Core formatter
- `prettier-plugin-astro` - Official Astro plugin for formatting `.astro` files

### ESLint Dependencies

```bash
yarn add -D eslint eslint-plugin-astro @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Packages**:
- `eslint` - Core linting engine
- `eslint-plugin-astro` - Official ESLint plugin for Astro
- `@typescript-eslint/parser` - TypeScript parser for ESLint
- `@typescript-eslint/eslint-plugin` - TypeScript linting rules

### Optional: Prettier + ESLint Integration

```bash
yarn add -D eslint-config-prettier
```

**Package**:
- `eslint-config-prettier` - Turns off ESLint rules that conflict with Prettier

---

## Phase 2: Configuration Files

### 1. Create `.prettierrc` (Root Directory)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-astro"],
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"
      }
    }
  ]
}
```

**Rationale**:
- `singleQuote: true` - Consistent with most modern JS projects
- `printWidth: 100` - Good balance for readability
- `semi: true` - Explicit semicolons
- Astro plugin configured for `.astro` files

### 2. Create `.prettierignore` (Root Directory)

```
# Build outputs
dist/
.vercel/
.astro/

# Dependencies
node_modules/

# Environment files
.env
.env.*

# Lock files
package-lock.json
yarn.lock

# Cache
.cache/

# Generated files
public/
```

### 3. Create `eslint.config.js` (Root Directory)

```javascript
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Base config for all files
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,astro}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Astro-specific config
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],

  // Disable conflicting rules with Prettier
  {
    rules: {
      // Prettier handles these
      'max-len': 'off',
      'quotes': 'off',
      'semi': 'off',
    },
  },
];
```

**Rationale**:
- Uses new ESLint flat config format (recommended for 2025+)
- TypeScript support with sensible defaults
- Astro-specific linting rules
- Accessibility rules for JSX in Astro
- Allows unused vars with `_` prefix (common pattern)
- Warns on `console.log` (except warn/error)

### 4. Create `.eslintignore` (Root Directory)

```
# Build outputs
dist/
.vercel/
.astro/

# Dependencies
node_modules/

# Environment files
.env
.env.*

# Configuration files
*.config.js
*.config.mjs

# Cache
.cache/

# Generated files
public/
```

---

## Phase 3: Update `package.json`

Add the following scripts to the `scripts` section:

```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "astro": "astro",
    "new-post": "node scripts/new-post.js",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint . --ext .js,.ts,.astro",
    "lint:fix": "eslint . --ext .js,.ts,.astro --fix",
    "check": "astro check && yarn lint && yarn format:check"
  }
}
```

**New Scripts**:
- `format` - Format all files with Prettier
- `format:check` - Check if files are formatted (CI-friendly)
- `lint` - Run ESLint on all files
- `lint:fix` - Run ESLint and auto-fix issues
- `check` - Run all checks (type check + lint + format check)

---

## Phase 4: VSCode Configuration

### 1. Create/Update `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[astro]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "astro"
  ]
}
```

**Features**:
- Format on save enabled
- Prettier as default formatter
- ESLint auto-fix on save
- Validates Astro files with ESLint

### 2. Create/Update `.vscode/extensions.json`

```json
{
  "recommendations": [
    "astro-build.astro-vscode",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

**Extensions**:
- Astro official extension
- Prettier extension
- ESLint extension

---

## Phase 5: Pre-commit Hook (Optional but Recommended)

### Install Husky + lint-staged

```bash
yarn add -D husky lint-staged
```

### Initialize Husky

```bash
npx husky init
```

### Create `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### Add lint-staged config to `package.json`

```json
{
  "lint-staged": {
    "*.{js,ts,astro}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

**Benefits**:
- Only formats/lints changed files (fast)
- Runs before every commit
- Prevents committing badly formatted code

---

## Phase 6: Format Existing Code

### Run formatter on entire codebase

```bash
yarn format
```

**Warning**: This will modify many files. Review changes carefully before committing.

### Fix auto-fixable ESLint issues

```bash
yarn lint:fix
```

### Review remaining ESLint warnings

```bash
yarn lint
```

Manually fix any remaining issues that can't be auto-fixed.

---

## Phase 7: Update CLAUDE.md

Add a new section to `CLAUDE.md`:

```markdown
## Code Quality Tools

### Formatting (Prettier)
- Auto-formats on save in VSCode
- Run manually: `yarn format`
- Check formatting: `yarn format:check`
- Config: `.prettierrc`

### Linting (ESLint)
- Auto-fixes on save in VSCode
- Run manually: `yarn lint`
- Fix auto-fixable issues: `yarn lint:fix`
- Config: `eslint.config.js`

### Pre-commit Hooks (Husky + lint-staged)
- Automatically formats and lints staged files before commit
- Prevents committing improperly formatted code
- Config: `lint-staged` in `package.json`

### Best Practices
- ✅ Always run `yarn check` before pushing
- ✅ Let VSCode auto-format on save
- ✅ Fix ESLint warnings as you code
- ❌ Don't disable ESLint rules without good reason
- ❌ Don't skip pre-commit hooks (--no-verify)
```

---

## Phase 8: CI/CD Integration (Optional)

### Update Vercel Build Command

If using Vercel, update build command to include checks:

```bash
yarn check && yarn build
```

**OR** add to `vercel.json`:

```json
{
  "buildCommand": "yarn check && yarn build"
}
```

### GitHub Actions (Optional)

Create `.github/workflows/lint.yml`:

```yaml
name: Lint & Format Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'
      - run: yarn install --frozen-lockfile
      - run: yarn lint
      - run: yarn format:check
      - run: yarn astro check
```

---

## Phase 9: Testing & Validation

### 1. Test Prettier

Create a poorly formatted test file:

```javascript
// test.js
const  foo={bar:1,baz:2};console.log(foo)
```

Run:
```bash
yarn format
```

Verify it formats correctly.

### 2. Test ESLint

Create a file with linting issues:

```javascript
// test-lint.js
var x = 1;
console.log(x);
const unused = 'test';
```

Run:
```bash
yarn lint
```

Verify it reports issues.

### 3. Test VSCode Integration

- Open a `.astro` file
- Make formatting changes
- Save file (should auto-format)
- Verify ESLint warnings appear in Problems panel

### 4. Test Pre-commit Hook (if configured)

```bash
git add .
git commit -m "test: pre-commit hook"
```

Verify lint-staged runs and formats files.

---

## Checklist

### Setup Phase
- [ ] Create new branch: `feature/add-prettier-eslint`
- [ ] Install Prettier dependencies
- [ ] Install ESLint dependencies
- [ ] Create `.prettierrc` config
- [ ] Create `.prettierignore`
- [ ] Create `eslint.config.js`
- [ ] Create `.eslintignore`
- [ ] Update `package.json` scripts

### VSCode Configuration
- [ ] Create/update `.vscode/settings.json`
- [ ] Create/update `.vscode/extensions.json`
- [ ] Install recommended VSCode extensions

### Optional Enhancements
- [ ] Install Husky + lint-staged
- [ ] Configure pre-commit hook
- [ ] Add CI/CD checks

### Code Migration
- [ ] Run `yarn format` on entire codebase
- [ ] Run `yarn lint:fix` to auto-fix issues
- [ ] Manually fix remaining lint warnings
- [ ] Review all changes carefully

### Documentation
- [ ] Update `CLAUDE.md` with code quality section
- [ ] Update `.gitignore` if needed

### Testing & Validation
- [ ] Test Prettier formatting
- [ ] Test ESLint linting
- [ ] Test VSCode integration
- [ ] Test pre-commit hook (if configured)
- [ ] Run `yarn check` to verify all checks pass

### Finalization
- [ ] Commit changes with clear message
- [ ] Push to remote
- [ ] Test on a fresh clone (optional)
- [ ] Merge to main

---

## Expected Changes Summary

### New Files (8-10 files)
1. `.prettierrc` - Prettier config
2. `.prettierignore` - Prettier ignore patterns
3. `eslint.config.js` - ESLint config
4. `.eslintignore` - ESLint ignore patterns
5. `.vscode/settings.json` - VSCode settings
6. `.vscode/extensions.json` - Recommended extensions
7. `.husky/pre-commit` - Pre-commit hook (optional)
8. `.github/workflows/lint.yml` - CI workflow (optional)

### Modified Files
1. `package.json` - Add dependencies and scripts
2. `CLAUDE.md` - Add code quality documentation

### Formatted Files
- All `.astro`, `.ts`, `.js`, `.json` files will be formatted
- Expect ~20-30 files to be modified

---

## Potential Issues & Solutions

### Issue 1: Prettier conflicts with Tailwind class ordering

**Solution**: Install `prettier-plugin-tailwindcss`:
```bash
yarn add -D prettier-plugin-tailwindcss
```

Add to `.prettierrc`:
```json
{
  "plugins": ["prettier-plugin-astro", "prettier-plugin-tailwindcss"]
}
```

### Issue 2: ESLint errors on valid Astro syntax

**Solution**: Make sure `eslint-plugin-astro` is properly configured and Astro files use the correct parser.

### Issue 3: Format on save not working

**Solution**:
1. Ensure Prettier VSCode extension is installed
2. Restart VSCode
3. Check `.vscode/settings.json` is correct
4. Verify default formatter is set to Prettier

### Issue 4: Pre-commit hook too slow

**Solution**:
- Use `lint-staged` to only check changed files
- Consider skipping formatting check in hook (rely on CI instead)

### Issue 5: Too many ESLint warnings

**Solution**:
- Start with `warn` instead of `error` for most rules
- Gradually fix warnings over time
- Adjust rules in `eslint.config.js` if too strict

---

## Resources

### Official Documentation
- [Astro Editor Setup](https://docs.astro.build/en/editor-setup/)
- [Prettier Astro Plugin](https://github.com/withastro/prettier-plugin-astro)
- [ESLint Astro Plugin](https://github.com/ota-meshi/eslint-plugin-astro)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Documentation](https://eslint.org/docs/latest/)

### Tools
- [Prettier Playground](https://prettier.io/playground/) - Test formatting rules
- [ESLint Playground](https://eslint.org/play/) - Test linting rules

---

## Timeline

1. **Setup (15 min)**: Install deps, create configs
2. **VSCode (5 min)**: Configure editor settings
3. **Format codebase (5 min)**: Run formatters, review changes
4. **Testing (10 min)**: Verify everything works
5. **Documentation (5 min)**: Update CLAUDE.md
6. **Optional enhancements (10 min)**: Husky, CI/CD

**Total**: ~30-45 minutes (without optional enhancements)

---

## Notes

- **Backward compatibility**: All configurations use modern ESLint flat config format
- **Team-friendly**: VSCode settings and extensions are shared via `.vscode/`
- **CI-ready**: All checks can run in CI without VSCode
- **Incremental adoption**: Can be added without breaking existing code
- **Future-proof**: Using official plugins maintained by Astro team

---

**Last Updated**: 2025-10-10
