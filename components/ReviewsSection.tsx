
import React, { useRef } from 'react';
import { Review } from '../types';
import { StarIcon, ArrowLeftIcon, ArrowRightIcon } from '../constants';

interface ReviewsSectionProps {
    reviews: Review[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    const approvedReviews = reviews.filter(r => r.is_approved);

    if (approvedReviews.length === 0) {
        return null;
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.9;
            scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="bg-slate-100 dark:bg-slate-950 py-16 sm:py-20">
            <div className="container mx-auto px-4 md:px-6">
                 <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                        Qué dicen nuestros <span className="text-rago-burgundy">clientes</span>
                    </h2>
                    <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        La confianza y satisfacción de quienes nos eligen es nuestro mayor orgullo.
                    </p>
                </div>

                 <div className="relative">
                    <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto py-4 -m-4 p-4 hide-scrollbar">
                        {approvedReviews.map((review, index) => (
                            <div key={review.id} className="flex-shrink-0 w-[90%] sm:w-1/2 md:w-1/3 stagger-child" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="h-full bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800 flex flex-col">
                                    <div className="flex mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} className="h-5 w-5 text-amber-400" filled={i < review.rating} />
                                        ))}
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{review.title || 'Excelente experiencia'}</h4>
                                    <p className="text-slate-600 dark:text-slate-400 flex-grow mb-4">"{review.review_text}"</p>
                                    <p className="font-bold text-slate-900 dark:text-white mt-auto">- {review.customer_name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {approvedReviews.length > 3 && (
                        <>
                            <button onClick={() => scroll('left')} aria-label="Anterior" className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <ArrowLeftIcon className="h-6 w-6"/>
                            </button>
                            <button onClick={() => scroll('right')} aria-label="Siguiente" className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <ArrowRightIcon className="h-6 w-6"/>
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
