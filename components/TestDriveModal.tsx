
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Vehicle } from '../types';
import { XIcon, SteeringWheelIcon, WhatsAppIcon } from '../constants';
import { trackEvent } from '../lib/analytics';

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

    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            // Reset state for next time
            setName('');
            setPhone('');
            setDateTime('');
        }, 300);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const vehicleName = `${vehicle.make} ${vehicle.model} ${vehicle.year}`;
        const message = `¡Hola! Quisiera agendar una prueba de manejo para el ${vehicleName}.\n\nMi nombre: ${name}\nTeléfono: ${phone}\nFecha/Hora de preferencia: ${dateTime}\n\n¡Gracias!`;
        const whatsappUrl = `https://wa.me/5492284635692?text=${encodeURIComponent(message)}`;
        
        trackEvent('click_schedule_test_drive', vehicle.id);
        window.open(whatsappUrl, '_blank');
        handleClose();
    };

    if (!isOpen) return null;

    const modalClasses = `fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-out ${isAnimatingOut ? 'bg-opacity-0' : 'bg-opacity-75'}`;
    const contentClasses = `bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out ${!isAnimatingOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
    
    return createPortal(
        <div className={modalClasses} onClick={handleClose}>
            <div className={contentClasses} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                    <div className="flex items-center gap-3">
                         <SteeringWheelIcon className="h-7 w-7 text-rago-burgundy" />
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Agendar Prueba de Manejo</h3>
                    </div>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white"><XIcon className="h-7 w-7" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">
                            Estás solicitando una prueba para el <strong className="text-rago-burgundy">{vehicle.make} {vehicle.model}</strong>. Por favor, completa tus datos.
                        </p>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 form-input" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono (con código de área)</label>
                            <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 form-input" placeholder="Ej: 2284 123456" />
                        </div>
                         <div>
                            <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha y Hora de Preferencia</label>
                            <input type="text" id="datetime" value={dateTime} onChange={e => setDateTime(e.target.value)} required className="mt-1 form-input" placeholder="Ej: Mañana por la tarde" />
                        </div>
                    </div>
                    <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-base font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-base font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 flex items-center gap-2">
                           <WhatsAppIcon className="h-5 w-5" />
                            Enviar por WhatsApp
                        </button>
                    </div>
                </form>
            </div>
            <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.375rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);transition:border-color .2s,box-shadow .2s;font-size:1rem;line-height:1.5rem}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>,
        document.getElementById('modal-root') || document.body
    );
};

export default TestDriveModal;
