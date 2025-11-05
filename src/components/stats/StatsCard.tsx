interface StatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

export function StatsCard({ label, value, unit }: StatsCardProps) {
  return (
    <article style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <p style={{ margin: '0.5rem 0', opacity: 0.8, fontSize: '0.9rem' }}>{label}</p>
      <h2 style={{ margin: '0.5rem 0', textAlign: 'center' }}>
        {value}
        {unit && <span style={{ fontSize: '0.6em', marginLeft: '0.25em', opacity: 0.7 }}>{unit}</span>}
      </h2>
    </article>
  );
}
