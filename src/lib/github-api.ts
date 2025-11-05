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
        throw new Error(`GitHub API error: ${response.status} ${response.statusText} (JSON parse error: ${err instanceof Error ? err.message : String(err)})`);
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

export type DayName =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export interface ContributionInsights {
  weeklyPattern: { day: DayName; avg: number };
  bestWeek: { startDate: string; endDate: string; total: number };
  recentActivity: { days: number; total: number; percentage: number };
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

function sortActivitiesByDate(activities: ActivityData[]): ActivityData[] {
  return [...activities].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function getPreviousDate(date: Date): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - 1);
  return copy;
}

function diffInDays(a: Date, b: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const diff = Math.abs(a.getTime() - b.getTime());
  return Math.round(diff / MS_PER_DAY);
}

export function calculateCurrentStreak(activities: ActivityData[]): number {
  if (activities.length === 0) {
    return 0;
  }

  const sorted = sortActivitiesByDate(activities);
  let streak = 0;
  let expectedDate = new Date(sorted[sorted.length - 1].date);

  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const activityDate = new Date(sorted[i].date);

    if (diffInDays(expectedDate, activityDate) > 0) {
      // Gap detected, streak stops
      break;
    }

    if (sorted[i].count === 0) {
      break;
    }

    streak += 1;
    expectedDate = getPreviousDate(expectedDate);
  }

  return streak;
}

export function calculateLongestStreak(activities: ActivityData[]): number {
  if (activities.length === 0) {
    return 0;
  }

  const sorted = sortActivitiesByDate(activities);
  let longest = 0;
  let current = 0;
  let previousDate: Date | null = null;

  for (const activity of sorted) {
    const activityDate = new Date(activity.date);

    if (activity.count === 0) {
      current = 0;
      previousDate = activityDate;
      continue;
    }

    if (previousDate && diffInDays(activityDate, previousDate) > 1) {
      current = 0;
    }

    current += 1;
    longest = Math.max(longest, current);
    previousDate = activityDate;
  }

  return longest;
}

export function getMostActiveDay(activities: ActivityData[]): DayName {
  if (activities.length === 0) {
    return 'sunday';
  }

  const dayStats = new Map<number, { sum: number; count: number }>();

  for (const activity of activities) {
    const day = new Date(activity.date).getDay();
    const current = dayStats.get(day) ?? { sum: 0, count: 0 };
    current.sum += activity.count;
    current.count += 1;
    dayStats.set(day, current);
  }

  let bestDay = 0;
  let bestAverage = -1;

  for (const [day, { sum, count }] of dayStats.entries()) {
    const average = count === 0 ? 0 : sum / count;
    if (average > bestAverage) {
      bestAverage = average;
      bestDay = day;
    }
  }

  const dayNames: DayName[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  return dayNames[bestDay] ?? 'sunday';
}

export function analyzeContributions(activities: ActivityData[]): ContributionInsights {
  const sorted = sortActivitiesByDate(activities);

  if (sorted.length === 0) {
    return {
      weeklyPattern: { day: 'sunday', avg: 0 },
      bestWeek: {
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        total: 0,
      },
      recentActivity: { days: 0, total: 0, percentage: 0 },
    };
  }

  const weeklyAverages = new Map<number, { sum: number; count: number }>();
  for (const activity of sorted) {
    const weekday = new Date(activity.date).getDay();
    const current = weeklyAverages.get(weekday) ?? { sum: 0, count: 0 };
    current.sum += activity.count;
    current.count += 1;
    weeklyAverages.set(weekday, current);
  }

  const dayNames: DayName[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  let topAverage = -1;
  let topIndex = 0;
  for (const [weekday, { sum, count }] of weeklyAverages.entries()) {
    const average = count === 0 ? 0 : sum / count;
    if (average > topAverage) {
      topAverage = average;
      topIndex = weekday;
    }
  }
  const topDay = dayNames[topIndex] ?? 'sunday';

  const windowSize = Math.min(7, sorted.length);
  let bestTotal = 0;
  let bestStartIndex = 0;
  let windowSum = 0;
  for (let i = 0; i < sorted.length; i += 1) {
    windowSum += sorted[i].count;

    if (i >= windowSize - 1) {
      const startIndex = i - (windowSize - 1);
      if (windowSum > bestTotal) {
        bestTotal = windowSum;
        bestStartIndex = startIndex;
      }
      windowSum -= sorted[startIndex].count;
    }
  }

  const startDate = new Date(sorted[bestStartIndex].date);
  const endDateIndex = Math.min(bestStartIndex + windowSize - 1, sorted.length - 1);
  const endDate = new Date(sorted[endDateIndex].date);

  const latestDate = new Date(sorted[sorted.length - 1].date);
  const thirtyDaysAgo = new Date(latestDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  let activeDays = 0;
  let totalRecent = 0;
  for (const activity of sorted) {
    const activityDate = new Date(activity.date);
    if (activityDate >= thirtyDaysAgo && activityDate <= latestDate) {
      if (activity.count > 0) {
        activeDays += 1;
      }
      totalRecent += activity.count;
    }
  }

  const consideredDays = Math.min(30, sorted.length);
  const percentage =
    consideredDays === 0 ? 0 : Math.round((activeDays / consideredDays) * 100);

  return {
    weeklyPattern: { day: topDay, avg: topAverage > 0 ? topAverage : 0 },
    bestWeek: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      total: bestTotal,
    },
    recentActivity: {
      days: activeDays,
      total: totalRecent,
      percentage,
    },
  };
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
