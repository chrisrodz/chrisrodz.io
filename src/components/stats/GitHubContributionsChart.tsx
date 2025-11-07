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
  ariaLabel: string;
}

export default function GitHubContributionsChart({
  data,
  months,
  weekdays,
  tooltipTemplate,
  legendLess,
  legendMore,
  ariaLabel,
}: GitHubContributionsChartProps) {
  return (
    <div role="img" aria-label={ariaLabel}>
      <ActivityCalendar
        data={data}
        colorScheme="light"
        theme={{
          light: ['var(--pico-muted-border-color)', 'var(--pico-primary-hover)'],
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
        showWeekdayLabels
        blockSize={12}
        blockMargin={4}
        fontSize={14}
      />
    </div>
  );
}
