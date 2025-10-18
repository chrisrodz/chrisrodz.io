applyTo:

- "src/lib/\*_/_.ts"
- "src/stores/\*_/_.ts"

---

# Library Code Instructions

## TypeScript Requirements

- **ALWAYS** use strict TypeScript types
- Export proper interfaces and types
- Use generics where appropriate
- Document complex functions with JSDoc

## Database Utilities

- **ALWAYS** handle null supabase client gracefully
- Return error objects instead of throwing
- Use proper TypeScript types from `src/lib/database.types.ts`

## Validation Schemas

- Use Zod for all input validation
- Export schemas from `src/lib/schemas/`
- Provide clear error messages
- Use transforms where needed

## State Management

- Use nanostores for client-side state
- Keep stores simple and focused
- Export proper TypeScript types

## Utility Functions

- Keep functions pure when possible
- Handle edge cases gracefully
- Return consistent types

## Example Patterns

```typescript
// Database utility with null safety
export async function getCoffeeEntries(): Promise<{
  data: CoffeeEntry[] | null;
  error: string | null;
}> {
  if (!supabase) {
    return { data: null, error: 'Database not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('coffees')
      .select('*, beans(*)')
      .order('brew_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Validation schema with clear messages
export const coffeeEntrySchema = z.object({
  bean_id: z.string().uuid({ message: 'Please select a valid bean' }),
  brew_date: z.string().date({ message: 'Invalid date format' }),
  brew_method: z.enum(['espresso', 'pour_over', 'french_press'], {
    errorMap: () => ({ message: 'Please select a brewing method' }),
  }),
  rating: z.number().min(1, 'Rating must be at least 1').max(10, 'Rating cannot exceed 10'),
});

// State store with TypeScript
export interface Bean {
  id: string;
  name: string;
  roaster?: string;
  origin?: string;
}

export const beansStore = atom<Bean[]>([]);

export function updateBeans(beans: Bean[]) {
  beansStore.set(beans);
}
```
