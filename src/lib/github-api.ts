import type { Activity } from 'react-activity-calendar';

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
export type ActivityData = Activity;

export type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface ContributionMetrics {
  currentStreak: number;
  longestStreak: number;
  mostActiveDay: DayKey;
}

export interface InsightData {
  weeklyPattern: {
    day: DayKey;
    avg: number;
  };
  bestWeek: {
    startDate: string;
    endDate: string;
    total: number;
  };
  recentActivity: {
    days: number;
    total: number;
    percentage: number;
  };
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

function normaliseDate(value: string): number {
  return new Date(`${value}T00:00:00Z`).getTime();
}

function sortActivitiesByDate(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => normaliseDate(a.date) - normaliseDate(b.date));
}

function getToday(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

export function calculateCurrentStreak(activities: Activity[]): number {
  if (!activities.length) return 0;

  const sorted = sortActivitiesByDate(activities);
  const today = getToday();
  let streak = 0;

  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const activity = sorted[index];
    const activityDate = normaliseDate(activity.date);

    if (activityDate > today) {
      continue;
    }

    if (activity.count === 0) {
      return streak;
    }

    streak += 1;
  }

  return streak;
}

export function calculateLongestStreak(activities: Activity[]): number {
  if (!activities.length) return 0;

  const sorted = sortActivitiesByDate(activities);
  let longest = 0;
  let current = 0;

  for (const activity of sorted) {
    if (activity.count > 0) {
      current += 1;
      if (current > longest) {
        longest = current;
      }
    } else {
      current = 0;
    }
  }

  return longest;
}

export function getMostActiveDay(activities: Activity[]): DayKey {
  if (!activities.length) return 'sun';

  const totals: Record<DayKey, { total: number; count: number }> = {
    sun: { total: 0, count: 0 },
    mon: { total: 0, count: 0 },
    tue: { total: 0, count: 0 },
    wed: { total: 0, count: 0 },
    thu: { total: 0, count: 0 },
    fri: { total: 0, count: 0 },
    sat: { total: 0, count: 0 },
  };

  const keys: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  for (const activity of activities) {
    const dayIndex = new Date(`${activity.date}T00:00:00Z`).getUTCDay();
    const key = keys[dayIndex];
    totals[key].total += activity.count;
    totals[key].count += 1;
  }

  return keys.reduce<DayKey>((best, key) => {
    const bestStats = totals[best];
    const candidateStats = totals[key];

    const bestAverage = bestStats.count === 0 ? 0 : bestStats.total / bestStats.count;
    const candidateAverage =
      candidateStats.count === 0 ? 0 : candidateStats.total / candidateStats.count;

    if (candidateAverage > bestAverage) {
      return key;
    }

    if (candidateAverage === bestAverage && candidateStats.total > bestStats.total) {
      return key;
    }

    return best;
  }, 'sun');
}

function getDayAverages(activities: Activity[]): Record<DayKey, { average: number }> {
  const totals: Record<DayKey, { total: number; count: number }> = {
    sun: { total: 0, count: 0 },
    mon: { total: 0, count: 0 },
    tue: { total: 0, count: 0 },
    wed: { total: 0, count: 0 },
    thu: { total: 0, count: 0 },
    fri: { total: 0, count: 0 },
    sat: { total: 0, count: 0 },
  };

  const keys: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  for (const activity of activities) {
    const dayIndex = new Date(`${activity.date}T00:00:00Z`).getUTCDay();
    const key = keys[dayIndex];
    totals[key].total += activity.count;
    totals[key].count += 1;
  }

  return keys.reduce<Record<DayKey, { average: number }>>(
    (acc, key) => {
      const entry = totals[key];
      acc[key] = {
        average: entry.count === 0 ? 0 : entry.total / entry.count,
      };
      return acc;
    },
    {
      sun: { average: 0 },
      mon: { average: 0 },
      tue: { average: 0 },
      wed: { average: 0 },
      thu: { average: 0 },
      fri: { average: 0 },
      sat: { average: 0 },
    }
  );
}

export function analyzeContributions(activities: Activity[]): InsightData {
  const sorted = sortActivitiesByDate(activities);
  const today = getToday();
  const dayKeys: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const dayAverages = getDayAverages(sorted);
  let weeklyDay: DayKey = 'sun';
  let weeklyAverage = 0;

  for (const key of dayKeys) {
    const { average } = dayAverages[key];
    if (average > weeklyAverage) {
      weeklyAverage = average;
      weeklyDay = key;
    }
  }

  let bestTotal = 0;
  let bestStartIndex = 0;
  let windowTotal = 0;
  const windowSize = 7;

  for (let index = 0; index < sorted.length; index += 1) {
    windowTotal += sorted[index].count;

    if (index >= windowSize) {
      windowTotal -= sorted[index - windowSize].count;
    }

    if (index >= windowSize - 1 && windowTotal > bestTotal) {
      bestTotal = windowTotal;
      bestStartIndex = index - windowSize + 1;
    }
  }

  const fallbackDate = new Date(today).toISOString().slice(0, 10);
  const bestStartDate = sorted[bestStartIndex]?.date ?? fallbackDate;
  const bestEndDate =
    sorted[Math.min(bestStartIndex + windowSize - 1, sorted.length - 1)]?.date ?? fallbackDate;

  const thirtyDaysAgo = today - 29 * 24 * 60 * 60 * 1000;
  let activeDays = 0;
  let recentTotal = 0;

  for (const activity of sorted) {
    const dateValue = normaliseDate(activity.date);
    if (dateValue < thirtyDaysAgo || dateValue > today) {
      continue;
    }

    if (activity.count > 0) {
      activeDays += 1;
    }
    recentTotal += activity.count;
  }

  const percentage = Math.round((activeDays / 30) * 100);

  return {
    weeklyPattern: {
      day: weeklyDay,
      avg: Number(weeklyAverage.toFixed(1)),
    },
    bestWeek: {
      startDate: bestStartDate,
      endDate: bestEndDate,
      total: bestTotal,
    },
    recentActivity: {
      days: activeDays,
      total: recentTotal,
      percentage: Number.isFinite(percentage) ? percentage : 0,
    },
  };
}
