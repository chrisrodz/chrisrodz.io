# Testing Guide

This project uses [Vitest](https://vitest.dev/) as the testing framework for unit and component tests.

## Running Tests

### Run all tests once

```bash
yarn test
```

### Run tests in watch mode (re-runs on file changes)

```bash
yarn test:watch
```

### Run tests with UI

```bash
yarn test:ui
```

### Run tests with coverage report

```bash
yarn test:coverage
```

## Test Structure

Tests are co-located with the source files they test:

- `src/lib/*.test.ts` - Unit tests for utility functions
- `src/components/**/*.test.tsx` - Component tests for React components

## Current Test Coverage

The test suite currently covers:

### Utility Functions (`src/lib/`)

- **cafe-stats.ts** - Coffee statistics calculations
  - `formatBrewRatio()` - Brew ratio formatting
  - `calculateStats()` - Statistics calculations
  - `getBrewMethodDistribution()` - Brew method distribution

- **auth.ts** - Session management
  - `createSession()` - Session creation
  - `validateSession()` - Session validation
  - `deleteSession()` - Session deletion

### React Components (`src/components/`)

- **StarRating.tsx** - Interactive star rating component
  - Rendering and user interactions
  - Keyboard accessibility
  - ARIA attributes

## Writing Tests

### Unit Tests

For pure functions in `src/lib/`:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-module';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Component Tests

For React components:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Configuration

- **vitest.config.ts** - Main Vitest configuration
- **vitest.setup.ts** - Test setup file (runs before all tests)

## CI/CD

Tests run automatically on:

- All pushes to `main` branch
- All pushes to `claude/**` branches
- All pull requests to `main`

See `.github/workflows/test.yml` for the GitHub Actions configuration.

## Next Steps

To expand test coverage, consider adding tests for:

- Additional utility functions in `src/lib/`
- More React components in `src/components/`
- Integration tests for API endpoints
- E2E tests for critical user flows
