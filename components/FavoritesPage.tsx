
import React from 'react';
import { Vehicle } from '../types';
import { useFavorites } from './FavoritesProvider';
import VehicleList from './VehicleList';
import { HeartIcon, ArrowRightIcon } from '../constants';

interface FavoritesPageProps {
    allVehicles: Vehicle[];
    onPlayVideo: (url: string) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ allVehicles, onPlayVideo }) => {
    const { favoriteIds } = useFavorites();

    const favoriteVehicles = React.useMemo(() => {
        if (!allVehicles || !favoriteIds) return [];
        const favoriteIdSet = new Set(favoriteIds);
        // Also filter out sold vehicles for a better user experience
        return allVehicles.filter(v => favoriteIdSet.has(v.id) && !v.is_sold);
    }, [allVehicles, favoriteIds]);

    // Premium Empty State
    if (favoriteVehicles.length === 0) {
        return (
            <div className="text-center py-20 md:py-28 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl shadow-lg dark:shadow-rago-glow border border-slate-200 dark:border-slate-800 animate-fade-in-up">
                <div className="relative inline-block">
                    <HeartIcon className="h-24 w-24 mx-auto text-rago-burgundy/10" />
                    <HeartIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 mx-auto text-rago-burgundy/20 animate-pulse-burgundy" />
                </div>
                <h1 className="mt-8 text-4xl font-black text-slate-800 dark:text-white tracking-tight">Tu garaje de favoritos está vacío</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-4 max-w-xl mx-auto">
                    Explora nuestro catálogo y pulsa el corazón para guardar los vehículos que más te interesen.
                </p>
                <a 
                    href="/#catalog" 
                    className="shimmer-effect group inline-flex items-center justify-center gap-3 mt-10 px-8 py-4 text-xl font-bold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                    <span>Explorar Catálogo</span>
                    <ArrowRightIcon className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
            </div>
        );
    }

    // Premium View with Favorites
    return (
        <div className="animate-fade-in">
            <div className="mb-10 text-center">
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    Mis Favoritos
                </h1>
                <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    Tu selección personal de vehículos. Revisa tus autos preferidos y da el siguiente paso.
                </p>
            </div>
            <VehicleList vehicles={favoriteVehicles} onPlayVideo={onPlayVideo} />
        </div>
    );
};

export default FavoritesPage;