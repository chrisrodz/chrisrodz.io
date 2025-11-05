import type { APIRoute } from 'astro';
import { config } from '../../lib/config';
import { fetchGitHubContributions, transformToActivityData } from '../../lib/github-api';

/**
 * API endpoint to fetch GitHub contributions
 * This endpoint acts as a server-side proxy to keep the GitHub token secure
 */
export const GET: APIRoute = async () => {
  // Check if GitHub is configured
  if (!config.github.isConfigured()) {
    return new Response(JSON.stringify({ error: 'GitHub not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch contributions from GitHub (token stays server-side)
    const calendar = await fetchGitHubContributions(config.github.username!, config.github.token!);

    // Transform to format compatible with react-activity-calendar
    const activities = transformToActivityData(calendar);

    return new Response(
      JSON.stringify({
        data: {
          activities,
          totalContributions: calendar.totalContributions,
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
    console.error('GitHub API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
