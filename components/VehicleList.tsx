
import React from 'react';
import { Vehicle } from '../types';
import VehicleCard from './VehicleCard';

interface VehicleListProps {
    vehicles: Vehicle[];
    onPlayVideo: (url: string) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onPlayVideo }) => {
    if (vehicles.length === 0) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">No se encontraron vehículos</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Intenta ajustar los filtros de búsqueda.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="stagger-child" style={{ animationDelay: `${index * 70}ms` }}>
                    <VehicleCard vehicle={vehicle} onPlayVideo={onPlayVideo} />
                </div>
            ))}
        </div>
    );
};

export default VehicleList;