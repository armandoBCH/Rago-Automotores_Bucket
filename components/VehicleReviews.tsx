
import React from 'react';
import { Review } from '../types';
import { StarIcon } from '../constants';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="h-5 w-5 text-amber-400" filled={i < rating} />
        ))}
    </div>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
             <p className="font-bold text-lg text-slate-800 dark:text-white">{review.customer_name}</p>
            <StarRating rating={review.rating} />
        </div>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed italic">
            "{review.comment}"
        </p>
    </div>
);

const VehicleReviews: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return (
             <div className="text-center py-12 px-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Aún no hay opiniones sobre este vehículo</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">¿Compraste este auto? ¡Sé el primero en dejar una reseña!</p>
                <a href="/dejar-resena" className="mt-4 inline-block px-6 py-2 font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker">
                    Dejar mi opinión
                </a>
            </div>
        );
    }
    
    return (
        <section>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Opiniones sobre este vehículo</h3>
                </div>
                <div className="p-6 space-y-6">
                    {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
                </div>
            </div>
        </section>
    );
};

export default VehicleReviews;