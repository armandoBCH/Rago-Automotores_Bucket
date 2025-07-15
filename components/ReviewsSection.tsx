
import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle, Review, ReviewInsert } from '../types';
import { ReviewIcon, MessageCircleIcon } from '../constants';
import StarRating from './StarRating';
import { trackEvent } from '../lib/analytics';

interface ReviewsSectionProps {
    vehicle: Vehicle;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ vehicle }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [newReview, setNewReview] = useState({ name: '', rating: 0, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/get-reviews?vehicle_id=${vehicle.id}`);
                if (!response.ok) throw new Error('Could not fetch reviews.');
                const data = await response.json();
                setReviews(data.reviews || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [vehicle.id]);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return total / reviews.length;
    }, [reviews]);
    
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newReview.rating === 0 || !newReview.name || !newReview.comment) {
            alert("Por favor, complete todos los campos.");
            return;
        }
        setIsSubmitting(true);
        
        const reviewData: ReviewInsert = {
            vehicle_id: vehicle.id,
            author_name: newReview.name,
            rating: newReview.rating,
            comment: newReview.comment,
        };

        try {
            const response = await fetch('/api/submit-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });
            if (!response.ok) throw new Error('Failed to submit review.');
            trackEvent('submit_review', vehicle.id);
            setSubmitSuccess(true);
        } catch (err) {
            alert("Ocurrió un error al enviar tu reseña. Inténtalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const ReviewItem: React.FC<{ review: Review }> = ({ review }) => (
        <div className="py-5 border-b border-slate-200 dark:border-slate-800 last:border-0">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-rago-burgundy text-lg">
                    {review.author_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-800 dark:text-white">{review.author_name}</h5>
                        <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-wrap">{review.comment}</p>
                    {review.admin_reply && (
                        <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border-l-4 border-rago-burgundy">
                            <p className="font-bold text-sm text-rago-burgundy flex items-center gap-2">
                                <MessageCircleIcon className="h-5 w-5" />
                                <span>Respuesta de Rago Automotores</span>
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 mt-1 italic whitespace-pre-wrap">{review.admin_reply}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
    
    const ReviewForm = () => (
         <div className="mt-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            {submitSuccess ? (
                <div className="text-center py-8">
                    <h4 className="text-2xl font-bold text-green-600">¡Gracias por tu reseña!</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">Será publicada una vez que sea aprobada por nuestro equipo.</p>
                </div>
            ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <h4 className="text-xl font-bold">Escribe tu opinión</h4>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tu Nombre</label>
                        <input type="text" id="name" value={newReview.name} onChange={e => setNewReview(p => ({...p, name: e.target.value}))} required className="mt-1 form-input"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tu Calificación</label>
                        <StarRating rating={newReview.rating} onRatingChange={r => setNewReview(p => ({...p, rating: r}))} size="md" className="mt-1"/>
                    </div>
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tu Comentario</label>
                        <textarea id="comment" value={newReview.comment} onChange={e => setNewReview(p => ({...p, comment: e.target.value}))} rows={4} required className="mt-1 form-input"></textarea>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setShowForm(false)} className="mr-2 px-4 py-2 text-base font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-base font-medium text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker disabled:opacity-50">
                            {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
                        </button>
                    </div>
                </form>
            )}
             <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.375rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>
    );

    return (
        <section>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <ReviewIcon className="h-7 w-7 text-rago-burgundy" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Opiniones de Clientes</h3>
                    </div>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-2">
                            <StarRating rating={averageRating} size="md" />
                            <span className="font-bold text-slate-700 dark:text-slate-200">{averageRating.toFixed(1)}</span>
                            <span className="text-sm text-slate-500">({reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'})</span>
                        </div>
                    )}
                </div>
                <div className="p-6">
                    {isLoading && <p>Cargando opiniones...</p>}
                    {error && <p className="text-red-500">No se pudieron cargar las opiniones.</p>}
                    {!isLoading && !error && reviews.length === 0 && (
                        <div className="text-center py-6">
                            <p className="text-slate-500">Este vehículo aún no tiene opiniones. ¡Sé el primero en dejar una!</p>
                        </div>
                    )}
                    {!isLoading && !error && reviews.length > 0 && (
                        <div className="space-y-4">
                           {reviews.map(review => <ReviewItem key={review.id} review={review} />)}
                        </div>
                    )}

                    {!showForm && (
                        <div className="mt-6 text-center">
                            <button onClick={() => setShowForm(true)} className="px-6 py-3 text-base font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-950 dark:bg-rago-burgundy dark:hover:bg-rago-burgundy-darker">
                                Dejar una Reseña
                            </button>
                        </div>
                    )}

                    {showForm && <ReviewForm />}
                </div>
            </div>
        </section>
    );
};

export default ReviewsSection;
