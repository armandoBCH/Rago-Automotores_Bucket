





import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Vehicle, FinancingConfig, Review } from '../types';
import ImageCarousel from './ImageCarousel';
import VehicleCard from './VehicleCard';
import SocialShareButtons from './SocialShareButtons';
import DescriptionCard from './DescriptionCard';
import { ShieldIcon, TagIcon, CalendarIcon, GaugeIcon, CogIcon, SlidersIcon, GasPumpIcon, ChatBubbleIcon, ArrowRightIcon, ArrowLeftIcon, HeartIcon, CarIcon, ArrowUpDownIcon, CalculatorIcon, SteeringWheelIcon } from '../constants';
import { trackEvent } from '../lib/analytics';
import { optimizeUrl, slugify } from '../utils/image';
import { useFavorites } from './FavoritesProvider';
import FinancingCalculator from './FinancingCalculator';
import TestDriveSection from './TestDriveSection';
import VehicleReviews from './VehicleReviews';

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
     <section>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Especificaciones</h3>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y md:divide-y-0 divide-gray-200 dark:divide-gray-800">
                 {specs.map((spec, index) => (
                    <div key={spec.label} className={` ${index % 2 !== 0 ? 'md:border-l md:pl-8 border-gray-200 dark:border-gray-800' : 'md:pr-8'}`}>
                        <SpecificationItem icon={spec.icon} label={spec.label} value={spec.value} />
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const ActionButton: React.FC<{icon: React.ReactNode; title: string; onClick: ()=>void, isActive: boolean}> = ({icon, title, onClick, isActive}) => (
    <button onClick={onClick} className={`w-full flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${isActive ? 'bg-rago-burgundy/10 border-rago-burgundy text-rago-burgundy shadow-lg' : 'bg-slate-100 dark:bg-slate-800/50 border-transparent hover:border-rago-burgundy/50 text-slate-700 dark:text-slate-300'}`}>
        {icon}
        <span className="text-base font-bold">{title}</span>
    </button>
);


const VehicleDetailPage: React.FC<VehicleDetailPageProps> = ({ vehicle, allVehicles, onPlayVideo, financingConfig, reviews }) => {
    const similarVehiclesRef = useRef<HTMLDivElement>(null);
    const { addFavorite, removeFavorite, isFavorite } = useFavorites();
    const isCurrentlyFavorite = isFavorite(vehicle.id);
    const [actionTab, setActionTab] = useState<string | null>(null);

    const vehicleReviews = useMemo(() => {
        if (!reviews) return [];
        return reviews.filter(r => r.vehicle_id === vehicle.id && r.is_visible === true);
    }, [reviews, vehicle.id]);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); 
        if (isCurrentlyFavorite) {
            removeFavorite(vehicle.id);
        } else {
            addFavorite(vehicle.id);
        }
    };

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

    const contactMessage = `Hola, estoy interesado en el ${vehicle.make} ${vehicle.model}.`;
    const whatsappLink = `https://wa.me/5492284635692?text=${encodeURIComponent(contactMessage)}`;
    const permutaMessage = `Hola, estoy interesado en el ${vehicle.make} ${vehicle.model} y quisiera consultar por una permuta.`;
    const whatsappPermutaLink = `https://wa.me/5492284635692?text=${encodeURIComponent(permutaMessage)}`;


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
        <div className="max-w-screen-lg mx-auto">
            <div className="mb-8 opacity-0 animate-fade-in-up">
                <Breadcrumb vehicle={vehicle} />
            </div>

            <div className="grid grid-cols-1 gap-8 md:gap-12 animate-fade-in">
                {/* 1. Image */}
                <div className="relative overflow-hidden lg:rounded-2xl lg:shadow-rago-lg aspect-[4/3] bg-gray-200 dark:bg-black">
                    <ImageCarousel images={vehicle.images} videoUrl={vehicle.video_url} onPlayVideo={onPlayVideo} />
                     {!vehicle.is_sold && (
                        <button
                            onClick={handleFavoriteClick}
                            className="absolute top-4 right-4 z-10 p-3 bg-white/70 dark:bg-black/70 backdrop-blur-sm rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none"
                            aria-label={isCurrentlyFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                        >
                            <HeartIcon
                                className={`h-7 w-7 transition-all duration-300 ${isCurrentlyFavorite ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}
                                filled={isCurrentlyFavorite}
                            />
                        </button>
                    )}
                    {vehicle.is_sold && (
                         <div className="absolute top-10 -left-16 w-64 transform -rotate-45 bg-gradient-to-br from-red-600 to-red-800 text-center text-white font-black text-2xl py-2 z-20 pointer-events-none shadow-lg">
                            Vendido
                        </div>
                    )}
                </div>

                {/* 2. Price and Title */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-subtle dark:shadow-subtle-dark">
                    <div className="flex justify-between items-center gap-x-4 border-b dark:border-gray-700 pb-4 mb-6 flex-wrap">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                            {vehicle.make} {vehicle.model}
                        </h1>
                        <span className="text-xl font-bold inline-block align-baseline py-1 px-4 rounded-full text-rago-burgundy bg-rago-burgundy/10 dark:text-white dark:bg-rago-burgundy">
                            {vehicle.year}
                        </span>
                    </div>
                    <div className="mb-6">
                        <p className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-rago-burgundy">
                            ${vehicle.price.toLocaleString('es-AR')}
                        </p>
                    </div>
                    {vehicle.is_sold ? (
                        <div className="group w-full flex items-center justify-center gap-3 text-center bg-slate-400 dark:bg-slate-700 text-white font-bold py-4 px-4 rounded-lg text-lg sm:text-xl cursor-not-allowed">
                            Vehículo Vendido
                        </div>
                    ) : (
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleWhatsAppClick}
                            className="group w-full flex items-center justify-center gap-3 text-center bg-gradient-to-r from-rago-burgundy to-rago-burgundy-darker hover:shadow-rago-glow text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 text-lg sm:text-xl transform hover:-translate-y-0.5 animate-pulse-burgundy"
                        >
                            <ChatBubbleIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
                            <span>Contactar por WhatsApp</span>
                        </a>
                    )}
                    <SocialShareButtons vehicle={vehicle} />
                </div>

                {/* 3. Action Tabs */}
                 {!vehicle.is_sold && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ActionButton icon={<CalculatorIcon className="h-8 w-8" />} title="Financiación" onClick={() => setActionTab(actionTab === 'financing' ? null : 'financing')} isActive={actionTab === 'financing'} />
                        <ActionButton icon={<SteeringWheelIcon className="h-8 w-8" />} title="Agendar Prueba" onClick={() => setActionTab(actionTab === 'test-drive' ? null : 'test-drive')} isActive={actionTab === 'test-drive'} />
                        <a href={whatsappPermutaLink} onClick={()=> trackEvent('click_trade-in_request', vehicle.id)} target="_blank" rel="noopener noreferrer" className="w-full flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 bg-slate-100 dark:bg-slate-800/50 border-transparent hover:border-rago-burgundy/50 text-slate-700 dark:text-slate-300">
                             <ArrowUpDownIcon className="h-8 w-8" />
                            <span className="text-base font-bold">Consultar por Permuta</span>
                        </a>
                    </div>
                )}
                
                <div className={`transition-all duration-500 ease-in-out grid ${actionTab ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        {actionTab === 'financing' && financingConfig && <FinancingCalculator config={financingConfig} vehiclePrice={vehicle.price} />}
                        {actionTab === 'test-drive' && <TestDriveSection vehicle={vehicle} />}
                    </div>
                </div>

                {/* 4. Specifications */}
                <SpecsCard specs={specs} />
                
                {/* 5. Description */}
                <DescriptionCard description={vehicle.description} />
                
                {/* 6. Reviews */}
                <VehicleReviews reviews={vehicleReviews} />

            </div>

            {relatedVehicles.length > 0 && (
                <section className="mt-16 lg:mt-24">
                     <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
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
        </div>
    );
};

export default VehicleDetailPage;