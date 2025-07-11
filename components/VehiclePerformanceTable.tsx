
import React, { useState, useMemo } from 'react';
import { Vehicle, AnalyticsEvent } from '../types';
import { optimizeUrl } from '../utils/image';
import { EyeIcon, ShareIcon, TargetIcon, UpIcon, DownIcon } from '../constants';
import { ChatBubbleIcon as WhatsAppIcon } from '../constants';

type PerformanceData = {
    vehicle: Vehicle;
    views: number;
    contacts: number;
    shares: number;
    contactRate: number;
};

type SortConfig = {
    key: keyof PerformanceData | 'vehicle';
    direction: 'asc' | 'desc';
} | null;

const VehiclePerformanceTable: React.FC<{ vehicles: Vehicle[]; events: AnalyticsEvent[] }> = ({ vehicles, events }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'views', direction: 'desc' });

    const performanceData: PerformanceData[] = useMemo(() => {
        return vehicles.map(vehicle => {
            const vehicleEvents = events.filter(e => e.vehicle_id === vehicle.id);
            const views = vehicleEvents.filter(e => e.event_type === 'view_vehicle').length;
            const contacts = vehicleEvents.filter(e => e.event_type === 'click_whatsapp').length;
            const shares = vehicleEvents.filter(e => e.event_type === 'click_share').length;
            const contactRate = views > 0 ? (contacts / views) * 100 : 0;
            return { vehicle, views, contacts, shares, contactRate };
        });
    }, [vehicles, events]);

    const sortedAndFilteredData = useMemo(() => {
        let sortableItems = [...performanceData];
        const lowercasedTerm = searchTerm.toLowerCase().trim();

        if (lowercasedTerm) {
            sortableItems = sortableItems.filter(item => 
                `${item.vehicle.make} ${item.vehicle.model}`.toLowerCase().includes(lowercasedTerm)
            );
        }

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;
                if (sortConfig.key === 'vehicle') {
                    aValue = `${a.vehicle.make} ${a.vehicle.model}`;
                    bValue = `${b.vehicle.make} ${b.vehicle.model}`;
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [performanceData, searchTerm, sortConfig]);

    const requestSort = (key: keyof PerformanceData | 'vehicle') => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <div className="w-4 h-4 opacity-30 group-hover:opacity-100"><UpIcon /></div>;
        }
        return sortConfig.direction === 'asc' ? <UpIcon className="h-4 w-4" /> : <DownIcon className="h-4 w-4" />;
    };

    const SortableHeader: React.FC<{ sortKey: keyof PerformanceData | 'vehicle'; children: React.ReactNode }> = ({ sortKey, children }) => (
        <th scope="col" className="px-4 py-3">
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 group w-full">
                {children}
                {getSortIcon(sortKey)}
            </button>
        </th>
    );

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-800">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar vehículo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm px-4 py-2 text-base bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rago-burgundy focus:border-transparent transition"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-base text-left text-slate-600 dark:text-slate-300">
                    <thead className="text-sm text-slate-700 uppercase bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
                        <tr>
                            <SortableHeader sortKey="vehicle">Vehículo</SortableHeader>
                            <SortableHeader sortKey="views"><EyeIcon className="h-5 w-5 mr-1 inline"/>Vistas</SortableHeader>
                            <SortableHeader sortKey="contacts"><WhatsAppIcon className="h-5 w-5 mr-1 inline"/>Contactos</SortableHeader>
                            <SortableHeader sortKey="shares"><ShareIcon className="h-5 w-5 mr-1 inline"/>Compartido</SortableHeader>
                            <SortableHeader sortKey="contactRate"><TargetIcon className="h-5 w-5 mr-1 inline"/>Tasa Contacto</SortableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredData.map(({ vehicle, views, contacts, shares, contactRate }) => (
                            <tr key={vehicle.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <img src={optimizeUrl(vehicle.images[0], { w: 64, h: 48, fit: 'cover' })} alt={vehicle.model} className="w-16 h-12 object-cover rounded-md flex-shrink-0 bg-slate-200 dark:bg-slate-700" />
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{vehicle.make} {vehicle.model}</p>
                                            <p className="text-sm text-slate-500">{vehicle.year}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-semibold text-lg text-center">{views}</td>
                                <td className="px-4 py-3 font-semibold text-lg text-center">{contacts}</td>
                                <td className="px-4 py-3 font-semibold text-lg text-center">{shares}</td>
                                <td className="px-4 py-3 font-semibold text-lg text-center">{contactRate.toFixed(1)}%</td>
                            </tr>
                        ))}
                         {sortedAndFilteredData.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-slate-500">
                                    {performanceData.length === 0 ? "No hay datos de rendimiento." : "No se encontraron vehículos."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VehiclePerformanceTable;
