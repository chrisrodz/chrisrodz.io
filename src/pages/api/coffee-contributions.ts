import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import type { CoffeeLogWithBean } from '../../lib/schemas/cafe';
import {
  transformToActivityData,
  calculateCurrentStreak,
  calculateLongestStreak,
} from '../../lib/cafe-stats';

/**
 * API endpoint to fetch coffee contributions
 * Returns activity calendar data and streak metrics
 */
export const GET: APIRoute = async () => {
  // Check if Supabase is configured
  if (!supabase) {
    return new Response(
      JSON.stringify({
        error: 'Database not configured. Coffee diary requires Supabase to be set up.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Fetch all coffee logs with bean details
    const { data, error: fetchError } = await supabase
      .from('coffee_logs')
      .select('*, bean:coffee_beans(*)')
      .order('brew_time', { ascending: false });

    if (fetchError) {
      console.error('Supabase query error:', fetchError);
      throw new Error(`Failed to fetch coffee logs: ${fetchError.message}`);
    }

    const logs = (data || []) as CoffeeLogWithBean[];

    // Transform to activity calendar format
    const activities = transformToActivityData(logs);

    // Calculate metrics
    const totalCoffees = logs.length;
    const currentStreak = calculateCurrentStreak(activities);
    const longestStreak = calculateLongestStreak(activities);

    return new Response(
      JSON.stringify({
        data: {
          activities,
          totalCoffees,
          currentStreak,
          longestStreak,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Cache for 1 hour
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  } catch (error) {
    console.error('Coffee contributions API error:', error);

    let errorMessage = 'Failed to fetch coffee contributions';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
