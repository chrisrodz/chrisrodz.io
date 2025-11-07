interface StatsCardProps {
  label: string;
  value: string | number;
}

export default function StatsCard({ label, value }: StatsCardProps) {
  return (
    <article style={{ textAlign: 'center' }} aria-label={`${label}: ${value}`}>
      <h3>{value}</h3>
      <p>{label}</p>
    </article>
  );
}
