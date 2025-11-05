import type { FC } from 'react';

interface InsightItem {
  id: string;
  text: string;
}

interface ContributionInsightsProps {
  heading: string;
  items: InsightItem[];
}

const ContributionInsights: FC<ContributionInsightsProps> = ({ heading, items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <article aria-live="polite">
      <header>
        <h3>{heading}</h3>
      </header>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </article>
  );
};

export default ContributionInsights;
