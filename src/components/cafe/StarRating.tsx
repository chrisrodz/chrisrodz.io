import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  className?: string;
}

const ratingLabels: Record<number, string> = {
  1: 'Undrinkable',
  2: 'Passable',
  4: 'Pretty good',
  5: 'Excellent',
};

export default function StarRating({ value, onChange, className = '' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const ratings = [1, 2, 4, 5];

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentRating: number) => {
    let newRating = currentRating;
    const currentIndex = ratings.indexOf(currentRating);

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex < ratings.length - 1) {
          newRating = ratings[currentIndex + 1];
        }
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex > 0) {
          newRating = ratings[currentIndex - 1];
        }
        break;
      case 'Home':
        e.preventDefault();
        newRating = ratings[0];
        break;
      case 'End':
        e.preventDefault();
        newRating = ratings[ratings.length - 1];
        break;
      default:
        return;
    }

    onChange(newRating);
    // Focus the new rating button
    const newIndex = ratings.indexOf(newRating);
    buttonRefs.current[newIndex]?.focus();
  };

  return (
    <div className={`star-rating ${className}`} role="radiogroup" aria-label="Quality rating">
      {ratings.map((rating, index) => {
        const isSelected = rating === value;
        const label = ratingLabels[rating];

        return (
          <button
            key={rating}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(rating)}
            onKeyDown={(e) => handleKeyDown(e, rating)}
            className="star-button"
            data-filled={isSelected}
            aria-label={`Rate as ${label}`}
          >
            <span>{label}</span>
          </button>
        );
      })}
      <small style={{ alignSelf: 'center', marginLeft: '0.5rem' }} aria-live="polite">
        {value > 0 ? ratingLabels[value] || 'Not rated' : 'Not rated'}
      </small>
    </div>
  );
}
