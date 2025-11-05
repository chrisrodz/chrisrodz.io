interface StatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

export function StatsCard({ label, value, unit }: StatsCardProps) {
  return (
    <article>
      <p>{label}</p>
      <h2>
        {value}
        {unit && <span className="unit">{unit}</span>}
      </h2>
    </article>
  );
}
