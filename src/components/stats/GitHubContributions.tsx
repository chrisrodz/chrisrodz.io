import { useEffect, useState } from 'react';
import ActivityCalendar from 'react-activity-calendar';
import type { Activity } from 'react-activity-calendar';

interface GitHubContributionsProps {
  locale: 'en' | 'es';
}

interface ContributionsData {
  activities: Activity[];
  totalContributions: number;
}

export default function GitHubContributions({ locale }: GitHubContributionsProps) {
  const [data, setData] = useState<ContributionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContributions() {
      try {
        const response = await fetch('/api/github-contributions');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch contributions');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchContributions();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p aria-busy="true">{locale === 'es' ? 'Cargando...' : 'Loading...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p>
          <strong>{locale === 'es' ? 'Error' : 'Error'}:</strong> {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const totalText =
    locale === 'es'
      ? `${data.totalContributions} contribuciones totales en ${currentYear}`
      : `${data.totalContributions} total contributions in ${currentYear}`;

  return (
    <div className="github-contributions">
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <p>
          <strong>{totalText}</strong>
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ActivityCalendar
          data={data.activities}
          colorScheme="light"
          theme={{
            light: [
              'var(--pico-muted-border-color)',
              'var(--pico-primary-background)',
              'var(--pico-primary)',
              'var(--pico-primary-hover)',
              'var(--pico-primary-focus)',
            ],
            dark: [
              'var(--pico-muted-border-color)',
              'var(--pico-primary-background)',
              'var(--pico-primary)',
              'var(--pico-primary-hover)',
              'var(--pico-primary-focus)',
            ],
          }}
          labels={{
            months: locale === 'es' ? monthsEs : monthsEn,
            weekdays: locale === 'es' ? weekdaysEs : weekdaysEn,
            totalCount:
              locale === 'es'
                ? '{{count}} contribuciones en {{year}}'
                : '{{count}} contributions in {{year}}',
            legend: {
              less: locale === 'es' ? 'Menos' : 'Less',
              more: locale === 'es' ? 'Más' : 'More',
            },
          }}
          showWeekdayLabels
          blockSize={12}
          blockMargin={4}
          fontSize={14}
        />
      </div>
    </div>
  );
}

// Month labels for Spanish
const monthsEs = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

// Month labels for English
const monthsEn = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Weekday labels for Spanish
const weekdaysEs = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Weekday labels for English
const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
