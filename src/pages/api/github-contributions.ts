import type { APIRoute } from 'astro';
import { config } from '../../lib/config';
import {
  fetchGitHubContributions,
  transformToActivityData,
  calculateCurrentStreak,
  calculateLongestStreak,
  getMostActiveDay,
  analyzeContributions,
} from '../../lib/github-api';

/**
 * API endpoint to fetch GitHub contributions
 * This endpoint acts as a server-side proxy to keep the GH_PERSONAL_TOKEN secure
 */
export const GET: APIRoute = async () => {
  // Check if GitHub is configured with detailed error messages
  if (!config.github.token) {
    return new Response(
      JSON.stringify({
        error:
          'GitHub Personal Access Token (GH_PERSONAL_TOKEN) is not configured in environment variables',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (!config.github.username) {
    return new Response(
      JSON.stringify({
        error: 'GitHub username (GITHUB_USERNAME) is not configured in environment variables',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }


  try {
    // Fetch contributions from GitHub (token stays server-side)
    const calendar = await fetchGitHubContributions(config.github.username!, config.github.token!);

    // Transform to format compatible with react-activity-calendar
    const activities = transformToActivityData(calendar);
    const metrics = {
      currentStreak: calculateCurrentStreak(activities),
      longestStreak: calculateLongestStreak(activities),
      mostActiveDay: getMostActiveDay(activities),
    };
    const insights = analyzeContributions(activities);

    return new Response(
      JSON.stringify({
        data: {
          activities,
          totalContributions: calendar.totalContributions,
          metrics,
          insights,
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

    let errorMessage = 'Failed to fetch GitHub contributions';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Provide more specific error messages for common issues
      if (error.message.includes('401')) {
        errorMessage = 'Invalid GitHub token. Please check your GH_PERSONAL_TOKEN';
        statusCode = 401;
      } else if (error.message.includes('403')) {
        errorMessage = 'GitHub API rate limit exceeded or insufficient permissions';
        statusCode = 403;
      } else if (error.message.includes('404')) {
        errorMessage = `GitHub user '${config.github.username}' not found`;
        statusCode = 404;
      }
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
