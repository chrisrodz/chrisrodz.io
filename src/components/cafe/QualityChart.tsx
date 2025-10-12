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
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No quality data available
      </div>
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
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: '200px' }}
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
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-gray-300 dark:text-gray-600"
              />
              <text
                x={padding - 5}
                y={y + 1.5}
                fontSize="4"
                textAnchor="end"
                className="fill-gray-600 dark:fill-gray-400"
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
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-blue-600 dark:text-blue-400"
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
              className="fill-blue-600 dark:fill-blue-400 stroke-white dark:stroke-gray-800"
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
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2 px-4">
        <span>{data[0]?.date}</span>
        {data.length > 2 && (
          <span>{data[Math.floor(data.length / 2)]?.date}</span>
        )}
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
