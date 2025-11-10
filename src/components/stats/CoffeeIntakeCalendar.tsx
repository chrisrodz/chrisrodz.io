import ActivityCalendar, { type Activity } from 'react-activity-calendar';

interface CoffeeIntakeCalendarProps {
  data: Activity[];
  months: string[];
  weekdays: string[];
  tooltipTemplate: string;
  legendLess: string;
  legendMore: string;
  ariaLabel: string;
}

export default function CoffeeIntakeCalendar({
  data,
  months,
  weekdays,
  tooltipTemplate,
  legendLess,
  legendMore,
  ariaLabel,
}: CoffeeIntakeCalendarProps) {
  return (
    <div role="img" aria-label={ariaLabel}>
      <ActivityCalendar
        data={data}
        colorScheme="light"
        theme={{
          light: [
            'var(--pico-card-background-color)',
            'var(--coffee-filter)',
            'var(--coffee-espresso)',
            'var(--coffee-contrast-dark-text)',
            'var(--coffee-contrast-dark-text)',
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
        showWeekdayLabels
        blockSize={12}
        blockMargin={4}
        fontSize={14}
      />
    </div>
  );
}
