'use client';

import { useState, useEffect } from 'react';
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

export default function GitHubContributionsChart({
  data,
  months,
  weekdays,
  tooltipTemplate,
  legendLess,
  legendMore,
}: GitHubContributionsChartProps) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive values
  const blockSize = viewportWidth < 640 ? 8 : viewportWidth < 1024 ? 10 : 12;
  const blockMargin = viewportWidth < 640 ? 2 : 4;
  const showWeekdaysValue = viewportWidth < 640 ? ['Mon', 'Wed', 'Fri'] : true;
  const fontSize = viewportWidth < 640 ? 12 : 14;

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
      showWeekdayLabels={showWeekdaysValue}
      blockSize={blockSize}
      blockMargin={blockMargin}
      fontSize={fontSize}
    />
  );
}
