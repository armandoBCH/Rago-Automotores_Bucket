
import React from 'react';
import { Vehicle } from '../types';
import ImageCarousel from './ImageCarousel';
import { XIcon, ShieldIcon, TagIcon, CalendarIcon, GaugeIcon, CogIcon, SlidersIcon, GasPumpIcon } from '../constants';

interface VehicleDetailModalProps {
    vehicle: Vehicle;
    onClose: () => void;
    onPlayVideo: (url: string) => void;
}

const SpecificationItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; }> = ({ icon, label, value }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <div className="flex items-center">
            <span className="text-rago-burgundy mr-4">{icon}</span>
            <span className="text-lg font-medium text-gray-600 dark:text-gray-400">{label}</span>
        </div>
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-right">{value}</span>
    </div>
);

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({ vehicle, onClose, onPlayVideo }) => {
    const contactMessage = `Hola, estoy interesado en el ${vehicle.make} ${vehicle.model}.`;
    const whatsappLink = `https://wa.me/5492284635692?text=${encodeURIComponent(contactMessage)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity" onClick={onClose}>
            <div 
                className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">{vehicle.make} {vehicle.model}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                        <XIcon className="h-9 w-9" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-12 p-6 md:p-8">
                        {/* Main Content (Image, Specs, Description) */}
                        <div className="lg:col-span-3">
                            <div className="aspect-[4/3] bg-gray-200 dark:bg-black rounded-lg overflow-hidden shadow-lg mb-8">
                                <ImageCarousel images={vehicle.images} videoUrl={vehicle.video_url} onPlayVideo={onPlayVideo} />
                            </div>
                            
                            <div className="space-y-10">
                                <section>
                                    <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow-sm overflow-hidden">
                                        <div className="bg-rago-burgundy px-6 py-3">
                                            <h3 className="text-2xl font-bold text-white">Especificaciones</h3>
                                        </div>
                                        <div className="p-6">
                                            <SpecificationItem icon={<ShieldIcon className="h-7 w-7"/>} label="Marca" value={vehicle.make} />
                                            <SpecificationItem icon={<TagIcon className="h-7 w-7"/>} label="Modelo" value={vehicle.model} />
                                            <SpecificationItem icon={<CalendarIcon className="h-7 w-7"/>} label="Año" value={vehicle.year} />
                                            <SpecificationItem icon={<GaugeIcon className="h-7 w-7"/>} label="Kilometraje" value={`${vehicle.mileage.toLocaleString()} km`} />
                                            <SpecificationItem icon={<CogIcon className="h-7 w-7"/>} label="Motor" value={vehicle.engine} />
                                            <SpecificationItem icon={<SlidersIcon className="h-7 w-7"/>} label="Transmisión" value={vehicle.transmission} />
                                            <SpecificationItem icon={<GasPumpIcon className="h-7 w-7"/>} label="Combustible" value={vehicle.fuel_type} />
                                        </div>
                                    </div>
                                </section>
                                
                                <section>
                                    <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow-sm overflow-hidden">
                                        <div className="bg-rago-burgundy px-6 py-3">
                                            <h3 className="text-2xl font-bold text-white">Descripción</h3>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Sticky Right Column (Price & CTA) */}
                        <div className="lg:col-span-2 mt-8 lg:mt-0">
                             <div className="lg:sticky lg:top-8 bg-white dark:bg-gray-900/50 p-8 rounded-lg shadow-lg">
                                <div className="text-center mb-6">
                                    <p className="text-6xl font-extrabold text-rago-burgundy">${vehicle.price.toLocaleString()}</p>
                                </div>
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full text-center block bg-rago-burgundy hover:bg-rago-burgundy-darker text-white font-bold py-5 px-4 rounded-lg transition-colors duration-300 text-2xl"
                                >
                                    Contactar por WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetailModal;
