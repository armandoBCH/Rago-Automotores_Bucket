

import React, { useState } from 'react';
import { Vehicle } from '../types';
import { optimizeUrl, slugify } from '../utils/image';
import { ArrowRightIcon, StarIcon, PlayIcon } from '../constants';
import { trackEvent } from '../lib/analytics';

interface VehicleCardProps {
    vehicle: Vehicle;
    onPlayVideo: (url: string) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPlayVideo }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    
    const imageSrc = vehicle.images?.[0] || '';

    const placeholderUrl = optimizeUrl(imageSrc, { w: 20, h: 15, fit: 'cover', blur: 2, output: 'webp' });
    const srcSet = [400, 600, 800, 1200]
        .map(w => `${optimizeUrl(imageSrc, { w, h: Math.round(w * 0.75), fit: 'cover', output: 'webp', q: 75 })} ${w}w`)
        .join(', ');
        
    const vehicleUrl = `/vehiculo/${slugify(`${vehicle.make} ${vehicle.model}`)}-${vehicle.id}`;
    
    const handlePlayClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (vehicle.video_url) {
            onPlayVideo(vehicle.video_url);
        }
    };

    return (
        <div 
            className={`relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800 ${!vehicle.is_sold && 'hover:shadow-rago-lg dark:hover:shadow-rago-glow dark:hover:border-rago-burgundy/40 hover:-translate-y-1.5'} group`}
        >
             {vehicle.is_sold && (
                <div
                    className="absolute top-10 -left-16 w-64 transform -rotate-45 bg-gradient-to-br from-red-600 to-red-800 text-center text-white font-black text-2xl py-2 z-20 pointer-events-none shadow-lg"
                >
                    Vendido
                </div>
            )}
            {vehicle.is_featured && !vehicle.is_sold && (
                <div className="absolute top-4 left-4 bg-gradient-to-br from-rago-burgundy to-amber-500 text-white text-sm font-extrabold px-4 py-2 rounded-lg z-10 shadow-lg flex items-center gap-2 border border-amber-300/50 transition-transform duration-300 group-hover:scale-105">
                    <StarIcon className="h-4 w-4" filled={true} />
                    <span className="tracking-wide">DESTACADO</span>
                </div>
            )}
             {vehicle.video_url && !vehicle.is_sold && (
                <button
                    onClick={handlePlayClick}
                    aria-label="Reproducir video"
                    className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full text-white border-2 border-white/50 transition-all duration-300 transform group-hover:scale-110 group-hover:bg-rago-burgundy hover:!scale-110 hover:!bg-rago-burgundy"
                >
                    <PlayIcon className="h-5 w-5 ml-0.5" />
                </button>
            )}
            <a href={vehicleUrl} className="block aspect-[4/3] overflow-hidden rounded-t-2xl">
                <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${placeholderUrl})` }}
                >
                    <img 
                        className={`w-full h-full object-cover transition-all duration-500 ${!vehicle.is_sold && 'group-hover:scale-105'}`}
                        src={optimizeUrl(imageSrc, { w: 800, h: 600, fit: 'cover', output: 'webp', q: 75 })}
                        srcSet={srcSet}
                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
                        alt={`${vehicle.make} ${vehicle.model}`} 
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setIsLoaded(true)}
                    />
                </div>
            </a>
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-baseline justify-between gap-x-3">
                     <a href={vehicleUrl} className="min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate group-hover:text-rago-burgundy dark:group-hover:text-rago-burgundy transition-colors">{vehicle.make} {vehicle.model}</h3>
                    </a>
                    <span className="text-sm font-semibold inline-block py-1 px-3 uppercase rounded-full text-rago-burgundy bg-rago-burgundy/10 dark:bg-slate-700/50 dark:text-slate-300 flex-shrink-0">
                        {vehicle.year}
                    </span>
                </div>
                
                <div className="flex-grow my-4">
                    <p className="text-2xl md:text-3xl font-black text-rago-burgundy">
                        ${vehicle.price.toLocaleString('es-AR')}
                    </p>
                </div>
                <div className="flex justify-between items-center text-base text-slate-600 dark:text-slate-400">
                    <span>{vehicle.mileage.toLocaleString('es-AR')} km</span>
                    <span>{vehicle.transmission}</span>
                </div>
                 <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700/50">
                    <a 
                        href={vehicleUrl}
                        onClick={() => trackEvent('click_card_details', vehicle.id)}
                        className="group flex w-full items-center justify-center gap-x-2 overflow-hidden rounded-lg bg-slate-800 dark:bg-gradient-to-br dark:from-rago-burgundy dark:to-rago-burgundy-darker px-4 py-3 text-center text-lg font-semibold text-white transition-all duration-300 hover:bg-slate-950 dark:hover:shadow-rago-lg focus:outline-none focus:ring-4 focus:ring-slate-400/50 dark:focus:ring-rago-burgundy/50"
                    >
                        <span className="transition-transform duration-300 ease-out group-hover:-translate-x-2">
                            Ver detalles
                        </span>
                        <div className="transform-gpu opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100">
                            <ArrowRightIcon className="h-5 w-5" />
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default VehicleCard;
