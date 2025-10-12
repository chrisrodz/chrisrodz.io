import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  className?: string;
}

export default function StarRating({ value, onChange, className = '' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const ratings = [1, 2, 3, 4, 5];

  return (
    <div className={`flex gap-3 ${className}`}>
      {ratings.map((rating) => {
        const isFilled = hoverValue !== null ? rating <= hoverValue : rating <= value;

        return (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            onMouseEnter={() => setHoverValue(rating)}
            onMouseLeave={() => setHoverValue(null)}
            className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isFilled
                ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                : 'bg-transparent border-gray-300 dark:border-gray-600'
            }`}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              cursor: 'pointer',
            }}
            aria-label={`Rate ${rating} out of 5`}
          >
            <span
              className={`text-sm font-medium ${
                isFilled ? 'text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {rating}
            </span>
          </button>
        );
      })}
      <span className="text-sm text-gray-600 dark:text-gray-400 self-center ml-2">
        {value > 0 ? `${value} / 5` : 'Not rated'}
      </span>
    </div>
  );
}
