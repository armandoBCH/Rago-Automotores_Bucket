
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { XIcon, CheckIcon, WhatsAppIcon } from '../constants';
import { Vehicle } from '../types';

interface TestDriveModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle;
}

const TestDriveModal: React.FC<TestDriveModalProps> = ({ isOpen, onClose, vehicle }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const message = `¡Hola! Quisiera agendar un Test Drive para el ${vehicle.make} ${vehicle.model}.\n\nNombre: ${name}\nTeléfono: ${phone}\nFecha/Hora de preferencia: ${dateTime}`;
        const whatsappUrl = `https://wa.me/5492284635692?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        handleClose();
    };

    const handleClose = () => {
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
                        <CheckIcon className="h-8 w-8 text-rago-burgundy" />
                        <h3 className="text-2xl font-semibold text-slate-800 dark:text-white">Solicitar Test Drive</h3>
                    </div>
                    <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white"><XIcon className="h-7 w-7" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">Vas a solicitar una prueba de manejo para el <strong className="text-rago-burgundy">{vehicle.make} {vehicle.model}</strong>. Por favor, completa tus datos.</p>
                    <div>
                        <label htmlFor="name" className="block text-base font-medium text-slate-700 dark:text-slate-300">Nombre completo</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 form-input" />
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-base font-medium text-slate-700 dark:text-slate-300">Teléfono (con código de área)</label>
                        <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 form-input" placeholder="Ej: 2284123456" />
                    </div>
                     <div>
                        <label htmlFor="datetime" className="block text-base font-medium text-slate-700 dark:text-slate-300">Fecha y hora de preferencia</label>
                        <input type="text" id="datetime" value={dateTime} onChange={e => setDateTime(e.target.value)} required className="mt-1 form-input" placeholder="Ej: Lunes 15 a las 10:00" />
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full flex items-center justify-center gap-3 px-5 py-3 text-lg font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600">
                            <WhatsAppIcon className="h-6 w-6" />
                            <span>Enviar solicitud por WhatsApp</span>
                        </button>
                    </div>
                </form>
            </div>
             <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.375rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);transition:border-color .2s,box-shadow .2s;font-size:1rem;line-height:1.5rem}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>,
        document.getElementById('modal-root')!
    );
};

export default TestDriveModal;
