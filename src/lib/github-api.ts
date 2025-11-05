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
