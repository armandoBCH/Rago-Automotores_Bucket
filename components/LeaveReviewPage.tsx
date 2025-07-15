
import React, { useState } from 'react';
import { Vehicle } from '../types';
import { StarIcon, HeartIcon } from '../constants';

interface LeaveReviewPageProps {
    vehicles: Vehicle[];
}

const StarRatingInput: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center justify-center gap-2" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                return (
                    <button
                        type="button"
                        key={ratingValue}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        className="transition-transform duration-200 hover:scale-110 focus:outline-none"
                    >
                        <StarIcon
                            className={`h-10 w-10 cursor-pointer transition-colors ${ratingValue <= (hoverRating || rating) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                            filled={ratingValue <= (hoverRating || rating)}
                        />
                    </button>
                );
            })}
        </div>
    );
};

const LeaveReviewPage: React.FC<LeaveReviewPageProps> = ({ vehicles }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        comment: '',
        vehicle_id: '',
        honeypot: ''
    });
    const [rating, setRating] = useState(0);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setMessage('Por favor, selecciona una calificación de estrellas.');
            setStatus('error');
            return;
        }
        setStatus('submitting');
        setMessage('');

        try {
            const response = await fetch('/api/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, rating }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Ocurrió un error.');

            setStatus('success');
            setMessage(data.message);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message);
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center py-20 md:py-28 animate-fade-in-up">
                <HeartIcon className="h-20 w-20 text-green-500 mx-auto" />
                <h1 className="mt-8 text-4xl font-black text-slate-800 dark:text-white tracking-tight">¡Gracias por tu reseña!</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-4 max-w-xl mx-auto">{message}</p>
                <a href="/" className="group inline-flex items-center justify-center gap-3 mt-10 px-8 py-4 text-xl font-bold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker">
                    Volver al inicio
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-12 animate-fade-in">
            <div className="text-center mb-10">
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Contanos tu experiencia</h1>
                <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">Tu opinión es muy importante para nosotros y para futuros clientes.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-lg font-medium text-center text-slate-700 dark:text-slate-300 mb-2">Tu calificación general</label>
                        <StarRatingInput rating={rating} setRating={setRating} />
                    </div>
                     <div>
                        <label htmlFor="customer_name" className="block text-base font-medium text-slate-700 dark:text-slate-300">Tu nombre</label>
                        <input id="customer_name" name="customer_name" type="text" value={formData.customer_name} onChange={handleChange} required className="form-input mt-1" />
                    </div>
                     <div>
                        <label htmlFor="comment" className="block text-base font-medium text-slate-700 dark:text-slate-300">Tu comentario</label>
                        <textarea id="comment" name="comment" value={formData.comment} onChange={handleChange} rows={5} required className="form-input mt-1"></textarea>
                    </div>
                     <div>
                        <label htmlFor="vehicle_id" className="block text-base font-medium text-slate-700 dark:text-slate-300">Vehículo que compraste (Opcional)</label>
                        <select id="vehicle_id" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} className="form-input mt-1">
                            <option value="">Fue una consulta general</option>
                            {vehicles.filter(v => v.is_sold).map(v => (
                                <option key={v.id} value={v.id}>{v.make} {v.model} ({v.year})</option>
                            ))}
                        </select>
                    </div>

                    {/* Honeypot field for spam */}
                    <input type="text" name="honeypot" value={formData.honeypot} onChange={handleChange} className="hidden" aria-hidden="true" />
                    
                    {status === 'error' && <p className="text-red-500 text-center">{message}</p>}

                    <button type="submit" disabled={status === 'submitting'} className="w-full flex items-center justify-center gap-2 px-5 py-3 text-lg font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker disabled:opacity-60">
                        {status === 'submitting' ? 'Enviando...' : 'Enviar Reseña'}
                    </button>
                </form>
            </div>
             <style>{`.form-input{display:block;width:100%;padding:0.75rem 1rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.5rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);transition:border-color .2s,box-shadow .2s;font-size:1rem;line-height:1.5rem}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>
    );
};

export default LeaveReviewPage;
