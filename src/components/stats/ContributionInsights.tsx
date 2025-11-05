import { useTranslations } from '@/lib/i18n';

interface ContributionInsightsProps {
  insights: {
    mostActiveDay: string;
    bestWeek: { startDate: string; total: number };
    recentActivity: { days: number; total: number; percentage: number };
  };
  locale: string;
}

export function ContributionInsights({ insights, locale }: ContributionInsightsProps) {
  const { t } = useTranslations(locale as any);

  // Format date for display (YYYY-MM-DD to readable format)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00Z');
    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get average contributions for the most active day
  const avgContributions = insights.bestWeek.total > 0 ? Math.round(insights.bestWeek.total / 7) : 0;

  return (
    <article>
      <h3>{t('stats.insights.heading')}</h3>
      <ul>
        <li>
          {t('stats.insights.weeklyPattern', {
            day: insights.mostActiveDay,
            avg: avgContributions,
          })}
        </li>
        <li>
          {t('stats.insights.bestWeek', {
            date: formatDate(insights.bestWeek.startDate),
            total: insights.bestWeek.total,
          })}
        </li>
        <li>
          {t('stats.insights.recentActivity', {
            days: insights.recentActivity.days,
            percentage: insights.recentActivity.percentage,
          })}
        </li>
      </ul>
    </article>
  );
}
