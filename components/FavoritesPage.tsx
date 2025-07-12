
import React from 'react';
import { Vehicle } from '../types';
import { useFavorites } from './FavoritesProvider';
import VehicleList from './VehicleList';
import { HeartIcon, ArrowRightIcon } from '../constants';

interface FavoritesPageProps {
    allVehicles: Vehicle[];
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ allVehicles }) => {
    const { favoriteIds } = useFavorites();

    const favoriteVehicles = React.useMemo(() => {
        if (!allVehicles || !favoriteIds) return [];
        const favoriteIdSet = new Set(favoriteIds);
        return allVehicles.filter(v => favoriteIdSet.has(v.id) && !v.is_sold);
    }, [allVehicles, favoriteIds]);

    if (favoriteVehicles.length === 0) {
        return (
            <div className="text-center py-16 md:py-24 bg-white dark:bg-slate-900 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800 animate-fade-in">
                <HeartIcon className="h-16 w-16 mx-auto text-rago-burgundy/30 mb-6" />
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Aún no has guardado favoritos</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">
                    Haz clic en el ícono de corazón en cualquier vehículo para guardarlo aquí y verlo más tarde.
                </p>
                <a href="/#catalog" className="group inline-flex items-center justify-center gap-3 mt-8 px-8 py-4 text-xl font-bold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <span>Explorar Catálogo</span>
                    <ArrowRightIcon className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Mis Favoritos</h1>
                <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
                    Aquí están los vehículos que has guardado. Los vehículos vendidos se eliminan automáticamente de esta lista.
                </p>
            </div>
            <VehicleList vehicles={favoriteVehicles} />
        </div>
    );
};

export default FavoritesPage;
