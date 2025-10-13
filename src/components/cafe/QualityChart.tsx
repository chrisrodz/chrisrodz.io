interface QualityDataPoint {
  date: string;
  avgRating: number;
  count: number;
}

interface QualityChartProps {
  data: QualityDataPoint[];
}

export default function QualityChart({ data }: QualityChartProps) {
  if (data.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '2rem 0' }}>
        <small>No quality data available</small>
      </p>
    );
  }

  // SVG dimensions
  const width = 100; // percentage
  const height = 200;
  const padding = 20;

  // Scale values
  const maxRating = 5;
  const minRating = 1;
  const xStep = (width - padding * 2) / Math.max(data.length - 1, 1);

  // Generate SVG path
  const points = data.map((point, index) => {
    const x = padding + index * xStep;
    const y =
      height - padding - ((point.avgRating - minRating) / (maxRating - minRating)) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '200px' }}
      >
        {/* Y-axis labels */}
        {[1, 2, 3, 4, 5].map((rating) => {
          const y =
            height - padding - ((rating - minRating) / (maxRating - minRating)) * (height - padding * 2);
          return (
            <g key={rating}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="var(--pico-muted-border-color)"
                strokeWidth="0.5"
              />
              <text
                x={padding - 5}
                y={y + 1.5}
                fontSize="4"
                textAnchor="end"
                fill="var(--pico-muted-color)"
              >
                {rating}
              </text>
            </g>
          );
        })}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--pico-primary)"
          strokeWidth="2.5"
        />

        {/* Points */}
        {data.map((point, index) => {
          const x = padding + index * xStep;
          const y =
            height - padding - ((point.avgRating - minRating) / (maxRating - minRating)) * (height - padding * 2);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3.5"
              fill="var(--pico-primary)"
              stroke="var(--pico-background-color)"
              strokeWidth="1"
            >
              <title>
                {point.date}: {point.avgRating.toFixed(1)} / 5 ({point.count} brews)
              </title>
            </circle>
          );
        })}
      </svg>

      {/* X-axis labels (show first, middle, last) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', padding: '0 1rem', fontSize: '0.75rem', color: 'var(--pico-muted-color)' }}>
        <span>{data[0]?.date}</span>
        {data.length > 2 && (
          <span>{data[Math.floor(data.length / 2)]?.date}</span>
        )}
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
