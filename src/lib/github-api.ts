/**
 * GitHub GraphQL API client for fetching contribution data
 */

/**
 * Contribution day data from GitHub API
 */
export interface GitHubContributionDay {
  contributionCount: number;
  date: string;
}

/**
 * Contribution week data from GitHub API
 */
export interface GitHubContributionWeek {
  contributionDays: GitHubContributionDay[];
}

/**
 * Contribution calendar data from GitHub API
 */
export interface GitHubContributionCalendar {
  totalContributions: number;
  weeks: GitHubContributionWeek[];
}

/**
 * GitHub API response structure
 */
export interface GitHubContributionsResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: GitHubContributionCalendar;
      };
    };
  };
}

/**
 * Error response from GitHub API
 */
export interface GitHubErrorResponse {
  message?: string;
  errors?: Array<{
    message: string;
  }>;
}

/**
 * GraphQL query to fetch user contribution calendar
 */
const CONTRIBUTIONS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetch GitHub contributions for a user
 *
 * @param username - GitHub username
 * @param token - GitHub personal access token with read:user scope
 * @returns Contribution calendar data
 */
export async function fetchGitHubContributions(
  username: string,
  token: string
): Promise<GitHubContributionCalendar> {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { username },
    }),
  });

  if (!response.ok) {
    // Try to get error details if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const errorData = (await response.json()) as GitHubErrorResponse;
        const errorMessage =
          errorData.message || errorData.errors?.map((e) => e.message).join(', ');
        throw new Error(
          `GitHub API error: ${errorMessage || `${response.status} ${response.statusText}`}`
        );
      } catch (err) {
        // If JSON parsing fails, include the parsing error message
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText} (JSON parse error: ${err instanceof Error ? err.message : String(err)})`
        );
      }
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as GitHubContributionsResponse | GitHubErrorResponse;

  // Check for GraphQL errors
  if ('errors' in json && json.errors) {
    const errorMessage = json.errors.map((e) => e.message).join(', ');
    throw new Error(`GitHub GraphQL error: ${errorMessage}`);
  }

  // Check for data
  if (!('data' in json) || !json.data?.user?.contributionsCollection?.contributionCalendar) {
    throw new Error('Invalid response from GitHub API');
  }

  return json.data.user.contributionsCollection.contributionCalendar;
}

/**
 * Activity data format compatible with react-activity-calendar
 */
export interface ActivityData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

/**
 * Transform GitHub contribution data to react-activity-calendar format
 *
 * @param calendar - GitHub contribution calendar data
 * @returns Array of activity data for the calendar component
 */
export function transformToActivityData(calendar: GitHubContributionCalendar): ActivityData[] {
  const activities: ActivityData[] = [];

  // Flatten weeks into days
  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      activities.push({
        date: day.date,
        count: day.contributionCount,
        level: getContributionLevel(day.contributionCount),
      });
    }
  }

  return activities;
}

/**
 * Calculate contribution level (0-4) based on count
 * Matches GitHub's intensity levels
 *
 * @param count - Number of contributions
 * @returns Intensity level from 0 (none) to 4 (high)
 */
function getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

/**
 * Calculate current contribution streak ending at most recent day
 *
 * @param activities - Array of activity data sorted by date
 * @returns Number of consecutive days with contributions ending at most recent day
 */
export function calculateCurrentStreak(activities: ActivityData[]): number {
  if (activities.length === 0) return 0;

  let streak = 0;

  // Iterate from most recent day backwards
  for (let i = activities.length - 1; i >= 0; i--) {
    if (activities[i].count > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest contribution streak in the activity history
 *
 * @param activities - Array of activity data sorted by date
 * @returns Length of longest consecutive days with contributions
 */
export function calculateLongestStreak(activities: ActivityData[]): number {
  if (activities.length === 0) return 0;

  let longestStreak = 0;
  let currentStreak = 0;

  for (const activity of activities) {
    if (activity.count > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
}

/**
 * Get the day of week with highest average contributions
 *
 * @param activities - Array of activity data sorted by date
 * @returns Name of most active day (e.g., "Monday") or "N/A" if no contributions
 */
export function getMostActiveDay(activities: ActivityData[]): string {
  if (activities.length === 0) return 'N/A';

  // Calculate totals and counts per day of week
  const dayStats: Record<number, { total: number; count: number }> = {};

  for (const activity of activities) {
    if (activity.count > 0) {
      // Parse date as UTC to avoid timezone issues
      const [year, month, day] = activity.date.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

      if (!dayStats[dayOfWeek]) {
        dayStats[dayOfWeek] = { total: 0, count: 0 };
      }

      dayStats[dayOfWeek].total += activity.count;
      dayStats[dayOfWeek].count++;
    }
  }

  // If no contributions at all
  if (Object.keys(dayStats).length === 0) return 'N/A';

  // Find day with highest average
  let maxAverage = 0;
  let mostActiveDay = 0;

  for (const [day, stats] of Object.entries(dayStats)) {
    const average = stats.total / stats.count;
    if (average > maxAverage) {
      maxAverage = average;
      mostActiveDay = parseInt(day);
    }
  }

  // Convert day number to name
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[mostActiveDay];
}
