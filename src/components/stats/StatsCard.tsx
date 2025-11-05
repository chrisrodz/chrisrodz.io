import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  footer?: ReactNode;
}

export default function StatsCard({ title, value, description, footer }: StatsCardProps) {
  return (
    <article aria-label={title}>
      <header>
        <h3>{title}</h3>
      </header>
      <p>
        <strong>{value}</strong>
      </p>
      {description ? <p className="muted">{description}</p> : null}
      {footer ? <footer>{footer}</footer> : null}
    </article>
  );
}
