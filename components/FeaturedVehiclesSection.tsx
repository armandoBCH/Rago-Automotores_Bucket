


import React from 'react';
import { Vehicle } from '../types';
import { ArrowLeftIcon, ArrowRightIcon } from '../constants';
import VehicleCard from './VehicleCard'; // Importar la tarjeta estándar

const FeaturedVehiclesSection: React.FC<{ vehicles: Vehicle[] }> = ({ vehicles }) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const featuredVehicles = React.useMemo(() => {
        return vehicles.filter(v => v.is_featured && !v.is_sold).sort((a,b) => a.make.localeCompare(b.make));
    }, [vehicles]);

    if (featuredVehicles.length === 0) {
        return null;
    }
    
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section id="featured-vehicles" className="relative bg-slate-900 dark:bg-rago-black pt-16 sm:pt-20 pb-16 sm:pb-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-sm">
                        Nuestros <span className="text-rago-burgundy">Destacados</span>
                    </h2>
                    <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        Una selección especial de vehículos con la mejor calidad y equipamiento.
                    </p>
                </div>
                <div className="relative">
                    <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto py-8 -mx-4 px-4 md:-mx-6 md:px-6 hide-scrollbar">
                        {featuredVehicles.map((vehicle) => (
                             <div key={vehicle.id} className="flex-shrink-0 w-[85%] sm:w-1/2 md:w-1/3 lg:w-1/4">
                                <div className="animate-pulse-border rounded-xl h-full">
                                    <VehicleCard vehicle={vehicle} />
                                </div>
                            </div>
                        ))}
                    </div>
                    {featuredVehicles.length > 3 && (
                        <>
                            <button 
                                onClick={() => scroll('left')} 
                                aria-label="Desplazar a la izquierda" 
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white transition-all duration-300 transform hover:scale-105"
                            >
                                <ArrowLeftIcon className="h-7 w-7" />
                            </button>
                            <button 
                                onClick={() => scroll('right')} 
                                aria-label="Desplazar a la derecha" 
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white transition-all duration-300 transform hover:scale-105"
                            >
                                <ArrowRightIcon className="h-7 w-7" />
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-24 overflow-hidden leading-[0]" style={{ transform: 'translateY(1px)' }}>
                <svg viewBox="0 0 960 100" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 45 L32 49.3 C64 53.7 128 62.3 192 61.2 C256 60 320 49 384 46.7 C448 44.3 512 50.7 576 57.7 C640 64.7 704 72.3 768 70.3 C832 68.3 896 56.7 928 50.8 L960 45 L960 101 L0 101Z" className="fill-slate-100 dark:fill-slate-950" />
                </svg>
            </div>
            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { scrollbar-width: none; }`}</style>
        </section>
    );
};

export default FeaturedVehiclesSection;