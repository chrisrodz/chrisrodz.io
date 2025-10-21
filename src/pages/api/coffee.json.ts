import type { APIRoute } from 'astro';
import { getServiceSupabase } from '../../lib/supabase';
import { CoffeeLogSchema, CoffeeBeanSchema } from '../../lib/schemas/cafe';
import { checkAuth } from '../../lib/auth';
import type { ApiErrorResponse, ApiSuccessResponse } from '../../lib/schemas/cafe';
import { ZodError } from 'zod';

/**
 * Security headers for all API responses
 */
const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
} as const;

/**
 * Helper function to create error responses
 */
function errorResponse(
  error: string,
  status: number,
  errorType?: ApiErrorResponse['errorType'],
  field?: string
): Response {
  const body: ApiErrorResponse = {
    error,
    errorType,
    field,
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: SECURITY_HEADERS,
  });
}

/**
 * Helper function to create success responses
 */
function successResponse<T>(data?: T, message?: string, status = 200): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    message,
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: SECURITY_HEADERS,
  });
}

export const GET: APIRoute = async () => {
  const supabase = getServiceSupabase();

  if (!supabase) {
    return errorResponse('Database not configured', 503, 'server');
  }

  try {
    const { data: coffees, error } = await supabase
      .from('coffees')
      .select('*, beans(name, roaster, origin)')
      .order('brew_date', { ascending: false });

    if (error) {
      return errorResponse(error.message, 500, 'server');
    }

    return successResponse(coffees);
  } catch (error) {
    console.error('Error fetching coffees:', error);
    return errorResponse('Internal server error', 500, 'server');
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  // Check authentication
  const isAuthed = checkAuth(cookies);
  if (!isAuthed) {
    return errorResponse('Unauthorized', 401, 'auth');
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return errorResponse('Database not configured', 503, 'server');
  }

  try {
    const formData = await request.formData();
    const action = formData.get('action');

    // Handle adding a new coffee bean
    if (action === 'add_bean') {
      const rawBeanData = {
        bean_name: formData.get('bean_name') as string,
        roaster: formData.get('roaster') || null,
        origin: formData.get('origin') || null,
        roast_date: formData.get('roast_date') || null,
        notes: formData.get('notes') || null,
        is_active: true,
      };

      try {
        const validatedBeanData = CoffeeBeanSchema.parse(rawBeanData);

        const { data: newBean, error } = await supabase
          .from('coffee_beans')
          .insert(validatedBeanData)
          .select()
          .single();

        if (error) {
          console.error('Database error adding bean:', error);
          return errorResponse(error.message, 500, 'server');
        }

        return successResponse(newBean, 'Bean added successfully', 201);
      } catch (error) {
        if (error instanceof ZodError) {
          const firstError = error.errors[0];
          return errorResponse(
            firstError.message,
            400,
            'validation',
            firstError.path.join('.')
          );
        }
        throw error;
      }
    }

    // Handle logging coffee
    if (action === 'log_coffee') {
      const rawData = {
        brew_method: formData.get('brew_method'),
        bean_id: formData.get('bean_id') || null,
        dose_grams: Number(formData.get('dose_grams')),
        yield_grams: formData.get('yield_grams') ? Number(formData.get('yield_grams')) : null,
        grind_setting: Number(formData.get('grind_setting')),
        quality_rating: Number(formData.get('quality_rating')),
        brew_time: formData.get('brew_time') as string,
        notes: formData.get('notes') || null,
      };

      try {
        const validatedData = CoffeeLogSchema.parse(rawData);

        const { data: newLog, error } = await supabase
          .from('coffee_logs')
          .insert(validatedData)
          .select()
          .single();

        if (error) {
          console.error('Database error logging coffee:', error);
          return errorResponse(error.message, 500, 'server');
        }

        return successResponse(newLog, 'Coffee logged successfully', 201);
      } catch (error) {
        if (error instanceof ZodError) {
          const firstError = error.errors[0];
          return errorResponse(
            firstError.message,
            400,
            'validation',
            firstError.path.join('.')
          );
        }
        throw error;
      }
    }

    return errorResponse('Invalid action', 400, 'validation');
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(
      'Internal server error',
      500,
      'server'
    );
  }
};
