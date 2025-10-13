import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  className?: string;
}

export default function StarRating({ value, onChange, className = '' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const ratings = [1, 2, 3, 4, 5];

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentRating: number) => {
    let newRating = currentRating;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newRating = Math.min(5, currentRating + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newRating = Math.max(1, currentRating - 1);
        break;
      case 'Home':
        e.preventDefault();
        newRating = 1;
        break;
      case 'End':
        e.preventDefault();
        newRating = 5;
        break;
      default:
        return;
    }

    onChange(newRating);
    // Focus the new rating button
    buttonRefs.current[newRating - 1]?.focus();
  };

  return (
    <div className={`star-rating ${className}`} role="radiogroup" aria-label="Quality rating">
      {ratings.map((rating) => {
        const isFilled = hoverValue !== null ? rating <= hoverValue : rating <= value;
        const isSelected = rating === value;

        return (
          <button
            key={rating}
            ref={(el) => {
              buttonRefs.current[rating - 1] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(rating)}
            onKeyDown={(e) => handleKeyDown(e, rating)}
            onMouseEnter={() => setHoverValue(rating)}
            onMouseLeave={() => setHoverValue(null)}
            className="star-button"
            data-filled={isFilled}
            aria-label={`Rate ${rating} out of 5`}
          >
            <span>{rating}</span>
          </button>
        );
      })}
      <small style={{ alignSelf: 'center', marginLeft: '0.5rem' }} aria-live="polite">
        {value > 0 ? `${value} / 5` : 'Not rated'}
      </small>
    </div>
  );
}
