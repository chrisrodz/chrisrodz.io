interface StatsCardProps {
  label: string;
  value: string | number;
}

export default function StatsCard({ label, value }: StatsCardProps) {
  return (
    <article style={{ textAlign: 'center' }}>
      <h2>{value}</h2>
      <p>{label}</p>
    </article>
  );
}
