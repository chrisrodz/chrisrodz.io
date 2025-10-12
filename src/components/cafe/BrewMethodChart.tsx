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
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No brew data available
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.method}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.method}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {item.count} ({item.percentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
