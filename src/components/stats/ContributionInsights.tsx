import type { ContributionInsights as InsightData } from '@/lib/github-api';
import type { Locale } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n-keys';

interface ContributionInsightsProps {
  insights: InsightData;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
  locale: Locale;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number) => string;
}

export default function ContributionInsights({
  insights,
  t,
  locale,
  formatDate,
  formatNumber,
}: ContributionInsightsProps) {
  const dayTranslationKey = `stats.metrics.dayNames.${insights.weeklyPattern.day}` as TranslationKey;
  const localizedDay = t(dayTranslationKey);
  const formattedAverage = formatNumber(Number(insights.weeklyPattern.avg.toFixed(1)));

  const startDate = new Date(insights.bestWeek.startDate);
  const endDate = new Date(insights.bestWeek.endDate);
  const formattedRange = `${formatDate(startDate, {
    month: 'short',
    day: 'numeric',
  })} – ${formatDate(endDate, {
    month: 'short',
    day: 'numeric',
  })}`;
  const formattedTotal = formatNumber(insights.bestWeek.total);

  const formattedActiveDays = formatNumber(insights.recentActivity.days);
  const formattedPercentage = formatNumber(insights.recentActivity.percentage);
  const formattedRecentTotal = formatNumber(insights.recentActivity.total);

  const items = [
    t('stats.insights.weeklyPattern', {
      day: localizedDay,
      avg: formattedAverage,
    }),
    t('stats.insights.bestWeek', {
      date: formattedRange,
      total: formattedTotal,
    }),
    t('stats.insights.recentActivity', {
      days: formattedActiveDays,
      percentage: formattedPercentage,
    }),
    t('stats.insights.recentTotal', {
      total: formattedRecentTotal,
    }),
  ];

  return (
    <article aria-labelledby="contribution-insights-heading">
      <header>
        <h2 id="contribution-insights-heading">{t('stats.insights.heading')}</h2>
      </header>
      <ul>
        {items.map((item, index) => (
          <li key={`${locale}-insight-${index}`}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
