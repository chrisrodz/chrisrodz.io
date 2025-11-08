import ActivityCalendar from 'react-activity-calendar';
import type { Activity } from 'react-activity-calendar';

interface CoffeeContributionsChartProps {
  data: Activity[];
  totalCoffees: number;
  year: number;
  months: string[];
  weekdays: string[];
  tooltipTemplate: string;
  legendLess: string;
  legendMore: string;
  ariaLabel: string;
}

export default function CoffeeContributionsChart({
  data,
  months,
  weekdays,
  tooltipTemplate,
  legendLess,
  legendMore,
  ariaLabel,
}: CoffeeContributionsChartProps) {
  return (
    <div role="img" aria-label={ariaLabel}>
      <ActivityCalendar
        data={data}
        colorScheme="light"
        theme={{
          light: ['#d4a574', '#5d4e37'], // Lightest brown to darkest brown
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
