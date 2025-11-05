import { useEffect, useMemo, useState } from 'react';
import ActivityCalendar from 'react-activity-calendar';
import type { Activity } from 'react-activity-calendar';

interface GitHubContributionsChartProps {
  data: Activity[];
  totalContributions: number;
  year: number;
  months: string[];
  weekdays: string[];
  tooltipTemplate: string;
  legendLess: string;
  legendMore: string;
}

const getInitialWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 1024);

export default function GitHubContributionsChart({
  data,
  months,
  weekdays,
  tooltipTemplate,
  legendLess,
  legendMore,
}: GitHubContributionsChartProps) {
  const [viewportWidth, setViewportWidth] = useState(getInitialWidth);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const blockSize = useMemo(() => {
    if (viewportWidth < 640) return 8;
    if (viewportWidth < 1024) return 10;
    return 12;
  }, [viewportWidth]);

  const blockMargin = useMemo(() => (viewportWidth < 640 ? 2 : 4), [viewportWidth]);

  const fontSize = useMemo(() => (viewportWidth < 640 ? 12 : 14), [viewportWidth]);

  const showWeekdayLabels = useMemo(() => {
    if (viewportWidth < 640) {
      return [weekdays[1], weekdays[3], weekdays[5]].filter(Boolean);
    }

    return true;
  }, [viewportWidth, weekdays]);

  const hideMonthLabels = viewportWidth < 480;

  return (
    <ActivityCalendar
      data={data}
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
        months,
        weekdays,
        totalCount: tooltipTemplate,
        legend: {
          less: legendLess,
          more: legendMore,
        },
      }}
      showWeekdayLabels={showWeekdayLabels}
      hideMonthLabels={hideMonthLabels}
      blockSize={blockSize}
      blockMargin={blockMargin}
      fontSize={fontSize}
    />
  );
}
