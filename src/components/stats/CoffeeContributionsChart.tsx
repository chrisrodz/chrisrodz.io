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
          light: ['#f5e6d3', '#e5c89c', '#d4a574', '#a97c50', '#5d4e37'], // 5-level brown gradient
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
