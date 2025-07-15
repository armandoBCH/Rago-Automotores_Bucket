
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { XIcon, StarIcon, PencilRulerIcon } from '../constants';
import { ReviewInsert } from '../types';

interface SubmitReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<Omit<ReviewInsert, 'is_approved'>>({ customer_name: '', rating: 5, title: '', review_text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Failed to submit review');
            onSuccess();
        } catch (error) {
            alert(`Error al enviar la reseña: ${(error as Error).message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setIsAnimatingOut(true);
        setTimeout(onClose, 300);
    };

    if (!isOpen) return null;
    
    const modalClasses = `fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-out ${isAnimatingOut ? 'bg-opacity-0' : 'bg-opacity-60'}`;
    const contentClasses = `bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
    
    return createPortal(
        <div className={modalClasses} onClick={handleClose}>
            <div className={contentClasses} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <PencilRulerIcon className="h-8 w-8 text-rago-burgundy" />
                        <h3 className="text-2xl font-semibold text-slate-800 dark:text-white">Dejanos tu opinión</h3>
                    </div>
                    <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white"><XIcon className="h-7 w-7" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="customer_name" className="block text-base font-medium text-slate-700 dark:text-slate-300">Tu nombre</label>
                        <input type="text" id="customer_name" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} required className="mt-1 form-input" />
                    </div>
                    <div>
                        <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-2">Tu calificación</label>
                        <div className="flex" onMouseLeave={() => setHoverRating(0)}>
                            {[...Array(5)].map((_, i) => {
                                const ratingValue = i + 1;
                                return (
                                    <button
                                        type="button"
                                        key={ratingValue}
                                        onClick={() => setFormData({...formData, rating: ratingValue})}
                                        onMouseEnter={() => setHoverRating(ratingValue)}
                                        className="text-amber-400 transition-transform duration-150 hover:scale-125"
                                    >
                                        <StarIcon className="h-8 w-8" filled={ratingValue <= (hoverRating || formData.rating)} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-base font-medium text-slate-700 dark:text-slate-300">Título de tu reseña</label>
                        <input type="text" id="title" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 form-input" placeholder="Ej: ¡El mejor servicio!" />
                    </div>
                    <div>
                        <label htmlFor="review_text" className="block text-base font-medium text-slate-700 dark:text-slate-300">Tu experiencia</label>
                        <textarea id="review_text" value={formData.review_text || ''} onChange={e => setFormData({...formData, review_text: e.target.value})} rows={4} className="mt-1 form-input" placeholder="Contanos más sobre tu experiencia..."></textarea>
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full px-5 py-3 text-lg font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker disabled:opacity-50">
                            {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
                        </button>
                    </div>
                </form>
            </div>
             <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.375rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);transition:border-color .2s,box-shadow .2s;font-size:1rem;line-height:1.5rem}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>,
        document.getElementById('modal-root')!
    );
};

export default SubmitReviewModal;
