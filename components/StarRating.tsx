
import React from 'react';
import { StarIcon } from '../constants';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, size = 'md', className = '' }) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    const sizeClasses = {
        sm: 'h-5 w-5',
        md: 'h-7 w-7',
        lg: 'h-9 w-9',
    };

    return (
        <div className={`flex items-center ${onRatingChange ? 'cursor-pointer' : ''} ${className}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!onRatingChange}
                    className={`text-slate-300 transition-all duration-150 ${onRatingChange ? 'hover:scale-110' : ''} ${
                        (hoverRating || rating) >= star ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'
                    }`}
                    onClick={() => onRatingChange?.(star)}
                    onMouseEnter={() => onRatingChange && setHoverRating(star)}
                    onMouseLeave={() => onRatingChange && setHoverRating(0)}
                    aria-label={`Rate ${star} stars`}
                >
                    <StarIcon filled={(hoverRating || rating) >= star} className={sizeClasses[size]} />
                </button>
            ))}
        </div>
    );
};

export default StarRating;
