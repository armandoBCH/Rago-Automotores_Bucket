
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Vehicle, FinancingConfig, Review } from '../types';
import ImageCarousel from './ImageCarousel';
import VehicleCard from './VehicleCard';
import SocialShareButtons from './SocialShareButtons';
import DescriptionCard from './DescriptionCard';
import { ShieldIcon, TagIcon, CalendarIcon, GaugeIcon, CogIcon, SlidersIcon, GasPumpIcon, ChatBubbleIcon, ArrowRightIcon, ArrowLeftIcon, CarIcon, ArrowUpDownIcon, CalculatorIcon, SteeringWheelIcon } from '../constants';
import { trackEvent } from '../lib/analytics';
import { optimizeUrl } from '../utils/image';
import { useFavorites } from './FavoritesProvider';
import FinancingCalculator from './FinancingCalculator';
import TestDriveSection from './TestDriveSection';
import VehicleReviews from './VehicleReviews';
import ActionModal from './ActionModal';

interface VehicleDetailPageProps {
    vehicle: Vehicle;
    allVehicles: Vehicle[];
    onPlayVideo: (url: string) => void;
    financingConfig: FinancingConfig;
    reviews: Review[];
}

const SpecificationItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; }> = ({ icon, label, value }) => (
    <div className="flex items-start justify-between py-4">
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 text-rago-burgundy">
               {icon}
            </div>
            <span className="text-base text-gray-600 dark:text-gray-400">{label}</span>
        </div>
        <span className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 text-right">{value}</span>
    </div>
);

const Breadcrumb: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl py-3 px-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-base font-medium text-slate-500 dark:text-slate-400 flex-wrap">
            <a href="/" className="hover:text-rago-burgundy transition-colors">Inicio</a>
            <ArrowRightIcon className="h-4 w-4 text-slate-400" />
            <a href="/#catalog" className="hover:text-rago-burgundy transition-colors">Catálogo</a>
            <ArrowRightIcon className="h-4 w-4 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs">{vehicle.make} {vehicle.model}</span>
        </nav>
    </div>
);

const SpecsCard: React.FC<{ specs: { icon: JSX.Element; label: string; value: string | number }[] }> = ({ specs }) => (
     <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Especificaciones</h3>
        </div>
        <div className="p-4 sm:p-6 divide-y divide-slate-200 dark:divide-slate-800">
             {specs.map((spec) => (
                <SpecificationItem key={spec.label} icon={spec.icon} label={spec.label} value={spec.value} />
            ))}
        </div>
    </div>
);

const VehicleDetailPage: React.FC<VehicleDetailPageProps> = ({ vehicle, allVehicles, onPlayVideo, financingConfig, reviews }) => {
    const similarVehiclesRef = useRef<HTMLDivElement>(null);
    const [modalContent, setModalContent] = useState<'financing' | 'test-drive' | null>(null);

    const vehicleReviews = useMemo(() => {
        if (!reviews) return [];
        return reviews.filter(r => r.vehicle_id === vehicle.id && r.is_visible === true);
    }, [reviews, vehicle.id]);

    useEffect(() => {
        trackEvent('view_vehicle_detail', vehicle.id);
        
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'Vehicle',
            'name': `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
            'url': window.location.href,
            'image': vehicle.images.map(img => optimizeUrl(img, { w: 1200, h: 800, fit: 'cover' })),
            'description': vehicle.description,
            'brand': {
                '@type': 'Brand',
                'name': vehicle.make
            },
            'model': vehicle.model,
            'vehicleCategory': vehicle.vehicle_type,
            'vehicleModelDate': String(vehicle.year),
            'mileageFromOdometer': {
                '@type': 'QuantitativeValue',
                'value': vehicle.mileage,
                'unitCode': 'KMT'
            },
            'fuelType': vehicle.fuel_type,
            'vehicleEngine': {
                '@type': 'EngineSpecification',
                'name': vehicle.engine
            },
            'vehicleTransmission': vehicle.transmission,
            'offers': {
                '@type': 'Offer',
                'price': vehicle.price,
                'priceCurrency': 'ARS',
                'availability': vehicle.is_sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
                'seller': {
                    '@type': 'AutoDealer',
                    'name': 'Rago Automotores',
                    'url': window.location.origin
                }
            }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'vehicle-json-ld';
        script.innerHTML = JSON.stringify(schema);

        const existingScript = document.getElementById('vehicle-json-ld');
        if (existingScript) {
            existingScript.remove();
        }
        document.head.appendChild(script);

        return () => {
            document.getElementById('vehicle-json-ld')?.remove();
        };

    }, [vehicle]);

    const handleWhatsAppClick = () => {
        trackEvent('click_whatsapp_vehicle', vehicle.id);
    };

    const contactMessage = `Hola, estoy interesado en el ${vehicle.make} ${vehicle.model} (${vehicle.year}).`;
    const whatsappLink = `https://wa.me/5492284635692?text=${encodeURIComponent(contactMessage)}`;

    const specs = [
        { icon: <ShieldIcon className="h-6 w-6"/>, label: "Marca", value: vehicle.make },
        { icon: <TagIcon className="h-6 w-6"/>, label: "Modelo", value: vehicle.model },
        { icon: <CarIcon className="h-6 w-6"/>, label: "Tipo", value: vehicle.vehicle_type },
        { icon: <CalendarIcon className="h-6 w-6"/>, label: "Año", value: vehicle.year },
        { icon: <GaugeIcon className="h-6 w-6"/>, label: "Kilometraje", value: `${vehicle.mileage.toLocaleString('es-AR')} km` },
        { icon: <CogIcon className="h-6 w-6"/>, label: "Motor", value: vehicle.engine },
        { icon: <SlidersIcon className="h-6 w-6"/>, label: "Transmisión", value: vehicle.transmission },
        { icon: <GasPumpIcon className="h-6 w-6"/>, label: "Combustible", value: vehicle.fuel_type },
    ];
    
    const relatedVehicles = useMemo(() => {
        if (!allVehicles || allVehicles.length <= 1) return [];
        const availableVehicles = allVehicles.filter(v => !v.is_sold);
        const priceRangeVehicles = availableVehicles.filter(v => {
            if (v.id === vehicle.id) return false;
            if (vehicle.price === 0) return false;
            const priceDiff = Math.abs(v.price - vehicle.price) / vehicle.price;
            return priceDiff <= 0.25;
        });
        const sameMake = availableVehicles.filter(v => v.id !== vehicle.id && v.make === vehicle.make);
        const combined = [...priceRangeVehicles, ...sameMake];
        const uniqueIds = new Set();
        const uniqueVehicles = combined.filter(v => {
            if (uniqueIds.has(v.id)) { return false; }
            uniqueIds.add(v.id);
            return true;
        });
        return uniqueVehicles.slice(0, 8);
    }, [vehicle, allVehicles]);

    const scrollSimilarVehicles = (direction: 'left' | 'right') => {
        if (similarVehiclesRef.current) {
            const scrollAmount = similarVehiclesRef.current.clientWidth * 0.9;
            similarVehiclesRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto">
            <div className="mb-8 opacity-0 animate-fade-in-up">
                <Breadcrumb vehicle={vehicle} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 animate-fade-in">
                <div className="relative overflow-hidden lg:rounded-2xl shadow-rago-lg aspect-[4/3] bg-gray-200 dark:bg-black">
                    <ImageCarousel images={vehicle.images} videoUrl={vehicle.video_url} onPlayVideo={onPlayVideo} />
                    {vehicle.is_sold && (
                        <div className="absolute top-10 -left-16 w-64 transform -rotate-45 bg-gradient-to-br from-red-600 to-red-800 text-center text-white font-black text-2xl py-2 z-20 pointer-events-none shadow-lg">Vendido</div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <div className="flex justify-between items-start gap-x-4 flex-wrap">
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{vehicle.make} {vehicle.model}</h1>
                        <span className="text-lg font-bold inline-block align-baseline py-1 px-4 rounded-full text-rago-burgundy bg-rago-burgundy/10 dark:text-white dark:bg-rago-burgundy">{vehicle.year}</span>
                    </div>

                    <div className="my-5">
                        <p className="text-5xl lg:text-6xl font-extrabold text-rago-burgundy">${vehicle.price.toLocaleString('es-AR')}</p>
                    </div>

                    {!vehicle.is_sold && (
                        <div className="my-3 p-3 text-center rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                            <p className="font-semibold text-base">¡Aceptamos tu usado en parte de pago!</p>
                        </div>
                    )}

                    <div className="mt-2 space-y-3">
                        {vehicle.is_sold ? (
                            <div className="w-full flex items-center justify-center gap-3 text-center bg-slate-400 dark:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-lg text-lg cursor-not-allowed">Vehículo Vendido</div>
                        ) : (
                            <>
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleWhatsAppClick}
                                    className="group w-full flex items-center justify-center gap-2 text-center bg-rago-burgundy hover:bg-rago-burgundy-darker text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-px"
                                >
                                    <ChatBubbleIcon className="h-5 w-5" />
                                    <span>Contactar por WhatsApp</span>
                                </a>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setModalContent('financing')} className="group w-full flex items-center justify-center gap-2 text-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-lg transition-all duration-300">
                                        <CalculatorIcon className="h-5 w-5"/>
                                        <span>Calcular Financiación</span>
                                    </button>
                                    <button onClick={() => setModalContent('test-drive')} className="group w-full flex items-center justify-center gap-2 text-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-lg transition-all duration-300">
                                        <SteeringWheelIcon className="h-5 w-5"/>
                                        <span>Agendar Test Drive</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-auto pt-6">
                        <SocialShareButtons vehicle={vehicle} />
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="space-y-8">
                     <DescriptionCard description={vehicle.description} />
                     <VehicleReviews reviews={vehicleReviews} />
                 </div>
                 <div className="lg:sticky top-28 h-fit">
                    <SpecsCard specs={specs} />
                 </div>
            </div>

            {relatedVehicles.length > 0 && (
                <section className="mt-16 lg:mt-24">
                     <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
                                Vehículos similares
                            </h2>
                        </div>
            
                        <div ref={similarVehiclesRef} className="flex gap-6 -m-4 p-4 overflow-x-auto pb-6 hide-scrollbar">
                            {relatedVehicles.map((relatedVehicle, index) => (
                                <div key={relatedVehicle.id} className="flex-shrink-0 w-[85%] sm:w-[45%] md:w-[40%] lg:w-[30%] xl:w-1/4 stagger-child" style={{ animationDelay: `${index * 80}ms` }}>
                                    <VehicleCard vehicle={relatedVehicle} onPlayVideo={onPlayVideo} />
                                </div>
                            ))}
                        </div>

                        {relatedVehicles.length > 3 && (
                            <>
                                <button 
                                    onClick={() => scrollSimilarVehicles('left')} 
                                    aria-label="Desplazar a la izquierda" 
                                    className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-full border border-white/20 dark:border-white/10 text-slate-800 dark:text-white hover:bg-white/50 dark:hover:bg-black/50 hover:border-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    <ArrowLeftIcon className="h-7 w-7" />
                                </button>
                                <button 
                                    onClick={() => scrollSimilarVehicles('right')} 
                                    aria-label="Desplazar a la derecha" 
                                    className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-full border border-white/20 dark:border-white/10 text-slate-800 dark:text-white hover:bg-white/50 dark:hover:bg-black/50 hover:border-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    <ArrowRightIcon className="h-7 w-7" />
                                </button>
                            </>
                        )}
                    </div>
                    <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                </section>
            )}

            {modalContent === 'financing' && financingConfig && (
                <ActionModal 
                    isOpen={modalContent === 'financing'}
                    onClose={() => setModalContent(null)}
                    title="Calculadora de Financiación"
                    icon={<CalculatorIcon className="h-6 w-6"/>}
                >
                    <FinancingCalculator config={financingConfig} vehiclePrice={vehicle.price} />
                </ActionModal>
            )}
            
            {modalContent === 'test-drive' && (
                <ActionModal 
                    isOpen={modalContent === 'test-drive'}
                    onClose={() => setModalContent(null)}
                    title="Agendar Prueba de Manejo"
                    icon={<SteeringWheelIcon className="h-6 w-6"/>}
                >
                    <TestDriveSection vehicle={vehicle} />
                </ActionModal>
            )}
        </div>
    );
};

export default VehicleDetailPage;
