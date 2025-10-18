applyTo:

- "src/pages/api/\*_/_.ts"
- "src/pages/**/api/**/\*.ts"

---

# API Route Instructions

## Response Format

- Always return proper HTTP status codes
- Use consistent JSON response format
- Handle errors gracefully with user-friendly messages

## Database Operations

- **ALWAYS** check `if (!supabase)` before database calls
- Return 503 status when database is unavailable
- Use Supabase service key for admin operations

## Validation

- **ALWAYS** validate inputs with Zod schemas
- Return 400 status for invalid input
- Sanitize all user input

## Authentication

- Check session auth with `checkAuth(Astro.cookies)`
- Return 401 for unauthorized requests
- Use `ADMIN_SECRET` for admin operations

## Example Pattern

```typescript
import type { APIRoute } from 'astro';
import { supabase, serviceSupabase } from '@/lib/supabase';
import { coffeeSchema } from '@/lib/schemas/cafe';
import { checkAuth } from '@/lib/auth';

export const GET: APIRoute = async ({ request }) => {
  // Check database availability
  if (!supabase) {
    return new Response(
      JSON.stringify({
        error: 'Database not configured',
        message: 'Coffee data is not available',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data, error } = await supabase
      .from('coffees')
      .select('*, beans(*)')
      .order('brew_date', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch coffee data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  // Check authentication
  const isAuth = checkAuth(cookies);
  if (!isAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate input
  const body = await request.json();
  const result = coffeeSchema.safeParse(body);

  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Invalid input', details: result.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Database operation with service key
  if (!serviceSupabase) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data, error } = await serviceSupabase
      .from('coffees')
      .insert(result.data)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ data }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create coffee entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```
