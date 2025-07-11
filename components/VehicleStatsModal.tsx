
import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Vehicle, AnalyticsEvent } from '../types';
import { XIcon, EyeIcon, WhatsAppIcon, ShareIcon } from '../constants';
import { optimizeUrl } from '../utils/image';

interface VehicleStatsModalProps {
    vehicle: Vehicle;
    allEvents: AnalyticsEvent[];
    onClose: () => void;
}

const StatItem: React.FC<{ value: number; label: string; icon: React.ReactNode }> = ({ value, label, icon }) => (
    <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
        <div className="p-3 bg-rago-burgundy/10 text-rago-burgundy rounded-full">{icon}</div>
        <div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-base text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    </div>
);

const VehicleStatsModal: React.FC<VehicleStatsModalProps> = ({ vehicle, allEvents, onClose }) => {
    const stats = useMemo(() => {
        const vehicleEvents = allEvents.filter(e => e.vehicle_id === vehicle.id);
        return {
            views: vehicleEvents.filter(e => e.event_type === 'view_vehicle').length,
            contacts: vehicleEvents.filter(e => e.event_type === 'click_whatsapp').length,
            shares: vehicleEvents.filter(e => e.event_type === 'click_share').length,
        };
    }, [allEvents, vehicle.id]);

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const modalContent = (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 ease-out"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Estadísticas del Vehículo</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors" aria-label="Cerrar modal">
                        <XIcon className="h-7 w-7"/>
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="flex items-start gap-5 mb-6">
                        <img 
                            src={optimizeUrl(vehicle.images[0], { w: 160, h: 120, fit: 'cover' })} 
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-40 h-30 object-cover rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0"
                        />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{vehicle.make} {vehicle.model}</p>
                            <p className="text-lg text-slate-500 dark:text-slate-400">{vehicle.year}</p>
                            <p className="mt-2 text-2xl font-extrabold text-rago-burgundy">${vehicle.price.toLocaleString('es-AR')}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatItem value={stats.views} label="Vistas" icon={<EyeIcon className="h-7 w-7" />} />
                        <StatItem value={stats.contacts} label="Contactos" icon={<WhatsAppIcon className="h-7 w-7" />} />
                        <StatItem value={stats.shares} label="Veces Compartido" icon={<ShareIcon className="h-7 w-7" />} />
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end">
                     <button onClick={onClose} className="px-5 py-2 text-base font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, modalRoot);
};

export default VehicleStatsModal;
