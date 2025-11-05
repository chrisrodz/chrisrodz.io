import type { FC } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
}

const StatsCard: FC<StatsCardProps> = ({ title, value, description }) => (
  <article aria-live="polite">
    <header>
      <h3>{title}</h3>
    </header>
    <p>
      <strong>{value}</strong>
    </p>
    {description ? <p>{description}</p> : null}
  </article>
);

export default StatsCard;
