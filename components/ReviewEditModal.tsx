import React, { useState, useEffect } from 'react';
import { Review, ReviewUpdate } from '../types';
import { XIcon, StarIcon } from '../constants';

interface ReviewEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (reviewData: ReviewUpdate) => Promise<void>;
    reviewData: Review;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className={`h-5 w-5 ${i < rating ? 'text-amber-400' : 'text-slate-300'}`} filled={i < rating} />
        ))}
    </div>
);

const ReviewEditModal: React.FC<ReviewEditModalProps> = ({ isOpen, onClose, onUpdate, reviewData }) => {
    const [response, setResponse] = useState('');
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimatingOut(false);
            setResponse(reviewData.response_from_owner || '');
        }
    }, [isOpen, reviewData]);

    const handleClose = () => {
        if (isSaving) return;
        setIsAnimatingOut(true);
        setTimeout(onClose, 200);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onUpdate({
                id: reviewData.id,
                response_from_owner: response,
            });
            // Parent component will close the modal on success
        } catch (error) {
            // Error is alerted by parent. Modal remains open for user to retry.
            console.error("Failed to update review:", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className={`fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-opacity duration-200 ease-out ${!isAnimatingOut ? 'bg-opacity-60' : 'bg-opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-200 ease-out ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Responder a la Reseña</h3>
                    <button onClick={handleClose} disabled={isSaving} className="text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-50"><XIcon className="h-6 w-6" /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border dark:border-slate-700">
                            <div className="flex justify-between items-start">
                                <p className="font-bold text-slate-800 dark:text-white">{reviewData.customer_name}</p>
                                <StarRating rating={reviewData.rating} />
                            </div>
                            <p className="mt-2 text-base text-slate-600 dark:text-slate-300 italic">
                                "{reviewData.comment || 'Sin comentario.'}"
                            </p>
                        </div>

                        <div>
                            <label htmlFor="response" className="block text-base font-medium text-slate-700 dark:text-slate-300">
                                Tu Respuesta
                            </label>
                            <textarea
                                id="response"
                                name="response"
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                rows={4}
                                className="mt-1 form-input"
                                placeholder="Escribe una respuesta pública al cliente..."
                            />
                            <p className="text-xs text-slate-500 mt-1">Esta respuesta será visible públicamente junto a la reseña.</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-3 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSaving}
                            className="px-4 py-2 text-base font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 text-base font-medium text-white bg-rago-burgundy rounded-md hover:bg-rago-burgundy-darker disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Respuesta'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`.form-input{display:block;width:100%;padding:0.75rem 1rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.5rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);transition:border-color .2s,box-shadow .2s;font-size:1rem;line-height:1.5rem}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>
    );
};

export default ReviewEditModal;