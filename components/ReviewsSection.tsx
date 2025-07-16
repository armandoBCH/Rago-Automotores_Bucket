
import React, { useRef, useMemo } from 'react';
import { Review } from '../types';
import { StarIcon, ArrowLeftIcon, ArrowRightIcon } from '../constants';

interface ReviewsSectionProps {
    reviews: Review[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="h-5 w-5 text-amber-400" filled={i < rating} />
        ))}
    </div>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800/50 p-8 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800">
        <div className="flex-grow">
            <StarRating rating={review.rating} />
            {review.comment && (
                <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{review.comment}"
                </p>
            )}
            {review.response_from_owner && (
                 <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4 rounded-lg">
                    <p className="font-bold text-sm text-slate-700 dark:text-white">Respuesta de Rago Automotores:</p>
                    <p className="mt-2 text-base text-slate-600 dark:text-slate-300 italic">
                        {review.response_from_owner}
                    </p>
                </div>
            )}
        </div>
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="font-bold text-slate-800 dark:text-white">{review.customer_name}</p>
        </div>
    </div>
);

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    const homepageReviews = useMemo(() => {
        return reviews.filter(r => r.show_on_homepage);
    }, [reviews]);

    if (homepageReviews.length === 0) {
        return null;
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.9;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    
    return (
        <section className="bg-slate-50 dark:bg-slate-950 py-16 sm:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Lo que dicen nuestros clientes
                    </h2>
                    <p className="mt-4 text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
                        La confianza y satisfacción de quienes nos eligen es nuestro mayor orgullo.
                    </p>
                </div>
                <div className="relative">
                     <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto py-8 -mx-4 px-4 md:-mx-6 md:px-6 hide-scrollbar">
                        {homepageReviews.map((review) => (
                             <div key={review.id} className="flex-shrink-0 w-[90%] sm:w-1/2 md:w-1/3">
                                <ReviewCard review={review} />
                            </div>
                        ))}
                    </div>
                     {homepageReviews.length > 3 && (
                        <>
                            <button 
                                onClick={() => scroll('left')} 
                                aria-label="Desplazar a la izquierda" 
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-all duration-300 transform hover:scale-105"
                            >
                                <ArrowLeftIcon className="h-7 w-7" />
                            </button>
                            <button 
                                onClick={() => scroll('right')} 
                                aria-label="Desplazar a la derecha" 
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-all duration-300 transform hover:scale-105"
                            >
                                <ArrowRightIcon className="h-7 w-7" />
                            </button>
                        </>
                    )}
                </div>
            </div>
             <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </section>
    );
};

export default ReviewsSection;