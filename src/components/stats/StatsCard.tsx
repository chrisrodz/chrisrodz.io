interface StatsCardProps {
  label: string;
  value: string | number;
}

export default function StatsCard({ label, value }: StatsCardProps) {
  return (
    <article style={{ textAlign: 'center' }}>
      <h3>{value}</h3>
      {label}
    </article>
  );
}
