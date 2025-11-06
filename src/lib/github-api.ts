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
 * Calculate the current streak of consecutive days with contributions
 * Counts backwards from most recent day
 *
 * @param activities - Array of activity data sorted by date
 * @returns Number of consecutive days with contributions
 */
export function calculateCurrentStreak(activities: ActivityData[]): number {
  if (activities.length === 0) return 0;

  // Sort by date descending (most recent first)
  const sorted = [...activities].sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Determine starting point: skip today if it has 0 contributions
  let startOffset = 0;
  if (sorted.length > 0) {
    const mostRecentDate = new Date(sorted[0].date);
    mostRecentDate.setHours(0, 0, 0, 0);
    console.log('Most recent activity date:', mostRecentDate);
    console.log('Today date:', today);
    // If most recent day is today and has 0 contributions, start from yesterday
    if (mostRecentDate.getTime() === today.getTime() && sorted[0].count === 0) {
      startOffset = 1;
    }
  }

  for (let i = startOffset; i < sorted.length; i++) {
    const activityDate = new Date(sorted[i].date);
    activityDate.setHours(0, 0, 0, 0);

    // Calculate the expected date for the current streak day
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i - 1);

    // Check if activity date matches expected date and has contributions
    if (activityDate.getTime() === expectedDate.getTime() && sorted[i].count > 0) {
      streak++;
    } else {
      // If date doesn't match or has no contributions, streak is broken
      break;
    }
  }

  return streak;
}

/**
 * Calculate the longest streak of consecutive days with contributions
 *
 * @param activities - Array of activity data
 * @returns Maximum number of consecutive days with contributions
 */
export function calculateLongestStreak(activities: ActivityData[]): number {
  if (activities.length === 0) return 0;

  // Sort by date ascending
  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));

  let longestStreak = 0;
  let currentStreak = 0;

  for (const activity of sorted) {
    if (activity.count > 0) {
      // Day has contributions, increment streak
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      // Day has 0 contributions, reset streak
      currentStreak = 0;
    }
  }

  return longestStreak;
}
