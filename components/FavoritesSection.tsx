

import React from 'react';
import { Vehicle } from '../types';
import { useFavorites } from './FavoritesProvider';
import VehicleCard from './VehicleCard';
import { ArrowLeftIcon, ArrowRightIcon } from '../constants';

interface FavoritesSectionProps {
    allVehicles: Vehicle[];
    onPlayVideo: (url: string) => void;
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({ allVehicles, onPlayVideo }) => {
    const { favoriteIds } = useFavorites();
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const favoriteVehicles = React.useMemo(() => {
        if (!allVehicles || !favoriteIds) return [];
        const favoriteIdSet = new Set(favoriteIds);
        return allVehicles.filter(v => favoriteIdSet.has(v.id));
    }, [allVehicles, favoriteIds]);

    if (favoriteVehicles.length === 0) {
        return null;
    }
    
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.9;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section className="container mx-auto px-4 md:px-6 py-8 -mt-16 mb-8 relative z-10">
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-md p-5 md:p-6 rounded-xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                        Tus Vehículos Guardados
                    </h2>
                    {favoriteVehicles.length > 3 && (
                        <div className="hidden md:flex gap-2">
                            <button onClick={() => scroll('left')} aria-label="Desplazar a la izquierda" className="w-10 h-10 rounded-full bg-slate-200/70 dark:bg-slate-800/70 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"><ArrowLeftIcon className="h-5 w-5" /></button>
                            <button onClick={() => scroll('right')} aria-label="Desplazar a la derecha" className="w-10 h-10 rounded-full bg-slate-200/70 dark:bg-slate-800/70 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"><ArrowRightIcon className="h-5 w-5" /></button>
                        </div>
                    )}
                </div>
                 <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                    {favoriteVehicles.map((vehicle) => (
                        <div key={vehicle.id} className="flex-shrink-0 w-[85%] sm:w-[45%] md:w-[40%] lg:w-[30%] xl:w-[23%]">
                            <VehicleCard vehicle={vehicle} onPlayVideo={onPlayVideo} />
                        </div>
                    ))}
                </div>
            </div>
            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { scrollbar-width: none; }`}</style>
        </section>
    );
};

export default FavoritesSection;