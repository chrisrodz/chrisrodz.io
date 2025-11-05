import { useEffect, useMemo, useState } from 'react';
import ActivityCalendar from 'react-activity-calendar';
import type { Activity } from 'react-activity-calendar';

interface GitHubContributionsChartProps {
  data: Activity[];
  months: string[];
  weekdays: string[];
  tooltipTemplate: string;
  legendLess: string;
  legendMore: string;
}

export default function GitHubContributionsChart({
  data,
  months,
  weekdays,
  tooltipTemplate,
  legendLess,
  legendMore,
}: GitHubContributionsChartProps) {
  const getViewportWidth = () =>
    typeof window !== 'undefined' ? window.innerWidth : 1024;

  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(getViewportWidth());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const condensedWeekdays = useMemo(
    () => [weekdays[1], weekdays[3], weekdays[5]].filter(Boolean),
    [weekdays]
  );

  const { blockSize, blockMargin, showWeekdayLabels, fontSize, hideMonthLabels } =
    useMemo(() => {
      if (viewportWidth < 640) {
        return {
          blockSize: 8,
          blockMargin: 2,
          showWeekdayLabels: condensedWeekdays.length > 0 ? condensedWeekdays : true,
          fontSize: 12,
          hideMonthLabels: true,
        };
      }

      if (viewportWidth < 1024) {
        return {
          blockSize: 10,
          blockMargin: 3,
          showWeekdayLabels: true,
          fontSize: 13,
          hideMonthLabels: false,
        };
      }

      return {
        blockSize: 12,
        blockMargin: 4,
        showWeekdayLabels: true,
        fontSize: 14,
        hideMonthLabels: false,
      };
    }, [viewportWidth, condensedWeekdays]);

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
      blockSize={blockSize}
      blockMargin={blockMargin}
      fontSize={fontSize}
      hideMonthLabels={hideMonthLabels}
    />
  );
}
