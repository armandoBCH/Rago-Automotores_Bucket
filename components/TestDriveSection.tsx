
import React, { useState } from 'react';
import { Vehicle } from '../types';
import { ArrowRightIcon } from '../constants';
import { trackEvent } from '../lib/analytics';

interface TestDriveSectionProps {
    vehicle: Vehicle;
}

const TestDriveSection: React.FC<TestDriveSectionProps> = ({ vehicle }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [preferredDate, setPreferredDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        trackEvent('click_test_drive_request', vehicle.id);
        const message = `Hola, quisiera agendar una prueba de manejo para el ${vehicle.make} ${vehicle.model} (${vehicle.year}).\n\nMi nombre: ${name}\nMi teléfono: ${phone}\nPreferencia de día/horario: ${preferredDate}`;
        const whatsappUrl = `https://wa.me/5492284635692?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div>
            <p className="mb-4 text-base text-gray-600 dark:text-gray-300">
                Completá el formulario para coordinar una prueba de manejo. Un asesor se pondrá en contacto para confirmar.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="sr-only">Nombre y Apellido</label>
                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre y Apellido" required className="form-input" />
                </div>
                <div>
                    <label htmlFor="phone" className="sr-only">Teléfono</label>
                    <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Tu número de teléfono" required className="form-input" />
                </div>
                <div>
                    <label htmlFor="preferredDate" className="sr-only">Preferencia de día y horario</label>
                    <textarea id="preferredDate" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} placeholder="Indicá tu preferencia de día y horario" required rows={3} className="form-input" />
                </div>
                <button type="submit" className="group w-full flex items-center justify-center gap-3 text-center bg-slate-800 hover:bg-slate-950 dark:bg-rago-burgundy dark:hover:bg-rago-burgundy-darker text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 text-lg">
                    <span>Solicitar por WhatsApp</span>
                    <ArrowRightIcon className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
            </form>
             <style>{`.form-input{display:block;width:100%;padding:0.75rem 1rem;background-color:#f9fafb;border:1px solid #d1d5db;border-radius:0.5rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);transition:border-color .2s,box-shadow .2s;font-size:1rem;line-height:1.5rem}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>
    );
};

export default TestDriveSection;
