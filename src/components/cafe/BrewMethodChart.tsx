interface BrewMethodData {
  method: string;
  count: number;
  percentage: number;
}

interface BrewMethodChartProps {
  data: BrewMethodData[];
}

export default function BrewMethodChart({ data }: BrewMethodChartProps) {
  if (data.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '2rem 0' }}>
        <small>No brew data available</small>
      </p>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="chart-container">
      {data.map((item) => (
        <div key={item.method} className="chart-item">
          <div className="chart-label">
            <strong>{item.method}</strong>
            <small>
              {item.count} ({item.percentage}%)
            </small>
          </div>
          <progress value={item.count} max={maxCount}></progress>
        </div>
      ))}
    </div>
  );
}
