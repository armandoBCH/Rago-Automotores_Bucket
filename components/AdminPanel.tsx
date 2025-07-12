import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Vehicle, AnalyticsEvent } from '../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, LogoutIcon, EyeIcon, ChatBubbleIcon as WhatsAppIcon, TargetIcon, StarIcon, CircleDollarSignIcon, GripVerticalIcon } from '../constants';
import { optimizeUrl } from '../utils/image';
import ConfirmationModal from './ConfirmationModal';
import VehicleStatsModal from './VehicleStatsModal';

interface AdminPanelProps {
    vehicles: Vehicle[];
    allEvents: AnalyticsEvent[];
    onAdd: () => void;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (vehicleId: number) => void;
    onLogout: () => void;
    onAnalyticsReset: () => void;
    onToggleFeatured: (vehicleId: number, currentStatus: boolean) => void;
    onToggleSold: (vehicleId: number, currentStatus: boolean) => void;
    onReorder: (reorderedVehicles: Vehicle[]) => void;
}

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-5">
        <div className="bg-rago-burgundy/10 text-rago-burgundy dark:bg-rago-burgundy/20 dark:text-rago-burgundy p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-base text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export const AdminPanel: React.FC<AdminPanelProps> = ({
    vehicles,
    allEvents,
    onAdd,
    onEdit,
    onDelete,
    onLogout,
    onAnalyticsReset,
    onToggleFeatured,
    onToggleSold,
    onReorder,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'sold' | 'featured'>('all');
    const [statsModalVehicle, setStatsModalVehicle] = useState<Vehicle | null>(null);
    const [resetAnalyticsModal, setResetAnalyticsModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const filteredVehicles = useMemo(() => {
        let tempVehicles = [...vehicles];
        if (filter === 'active') tempVehicles = tempVehicles.filter(v => !v.is_sold);
        if (filter === 'sold') tempVehicles = tempVehicles.filter(v => v.is_sold);
        if (filter === 'featured') tempVehicles = tempVehicles.filter(v => v.is_featured);

        const lowercasedTerm = searchTerm.toLowerCase().trim();
        if (lowercasedTerm) {
            return tempVehicles.filter(v => 
                `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(lowercasedTerm)
            );
        }
        return tempVehicles;
    }, [vehicles, filter, searchTerm]);

    const [orderedVehicles, setOrderedVehicles] = useState(filteredVehicles);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        setOrderedVehicles(filteredVehicles);
    }, [filteredVehicles]);

    const isReorderEnabled = filter === 'all' && searchTerm === '';

    const handleDragStart = (position: number) => {
        dragItem.current = position;
    };
    
    const handleDragEnter = (position: number) => {
        if (dragItem.current === null) return;

        const newOrderedVehicles = [...orderedVehicles];
        const draggedItemContent = newOrderedVehicles.splice(dragItem.current, 1)[0];
        newOrderedVehicles.splice(position, 0, draggedItemContent);
        dragItem.current = position;
        setOrderedVehicles(newOrderedVehicles);
    };

    const handleDragEnd = () => {
        if (dragItem.current !== null) {
            onReorder(orderedVehicles);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const performanceData = useMemo(() => {
        const data = new Map<number, { views: number, contactRate: string }>();
        vehicles.forEach(vehicle => {
            const vehicleEvents = allEvents.filter(e => e.vehicle_id === vehicle.id);
            const views = vehicleEvents.filter(e => e.event_type === 'view_vehicle').length;
            const contacts = vehicleEvents.filter(e => e.event_type === 'click_whatsapp').length;
            const contactRate = views > 0 ? ((contacts / views) * 100).toFixed(1) + '%' : '0.0%';
            data.set(vehicle.id, { views, contactRate });
        });
        return data;
    }, [vehicles, allEvents]);

    const stats = useMemo(() => {
        const totalViews = allEvents.filter(e => e.event_type === 'view_vehicle').length;
        const totalContacts = allEvents.filter(e => e.event_type === 'click_whatsapp').length;
        const totalShares = allEvents.filter(e => e.event_type === 'click_share').length;
        const activeVehicles = vehicles.filter(v => !v.is_sold).length;
        const featuredVehicles = vehicles.filter(v => v.is_featured).length;
        return { totalViews, totalContacts, totalShares, activeVehicles, featuredVehicles };
    }, [allEvents, vehicles]);

    const handleResetAnalytics = async () => {
        const password = prompt("Para confirmar, por favor ingrese la contraseña de administrador:");
        if (!password) return;

        setIsResetting(true);
        try {
            const response = await fetch('/api/reset-analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al reiniciar las estadísticas.');
            alert('Estadísticas reiniciadas con éxito.');
            onAnalyticsReset();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsResetting(false);
            setResetAnalyticsModal(false);
        }
    };
    
    return (
        <div className="space-y-8 text-slate-800 dark:text-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Panel de Administración</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">Gestiona vehículos y visualiza el rendimiento.</p>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 text-base font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400/50 transition-all"
                >
                    <LogoutIcon className="h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>
            
            <div>
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Estadísticas Globales</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Vehículos Activos" value={stats.activeVehicles} icon={<CircleDollarSignIcon className="h-7 w-7"/>} />
                    <StatCard title="Total de Vistas" value={stats.totalViews.toLocaleString()} icon={<EyeIcon className="h-7 w-7"/>} />
                    <StatCard title="Total de Contactos" value={stats.totalContacts.toLocaleString()} icon={<WhatsAppIcon className="h-7 w-7"/>} />
                    <StatCard title="Total de Destacados" value={stats.featuredVehicles} icon={<StarIcon className="h-7 w-7"/>} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Listado de Vehículos</h2>
                        <p className="text-slate-500 dark:text-slate-400">Total: {vehicles.length} vehículos.</p>
                     </div>
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 px-5 py-3 text-base font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all transform hover:-translate-y-px"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Añadir Vehículo
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                     <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por marca, modelo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-base bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rago-burgundy focus:border-transparent transition"
                        />
                    </div>
                     <select
                        value={filter}
                        onChange={e => setFilter(e.target.value as any)}
                        className="w-full sm:w-auto px-4 py-2 text-base bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rago-burgundy focus:border-transparent transition appearance-none bg-no-repeat"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="featured">Destacados</option>
                        <option value="sold">Vendidos</option>
                    </select>
                </div>
                {!isReorderEnabled && (
                    <div className="mb-4 p-3 text-sm text-center bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-500/50">
                        El reordenamiento manual está deshabilitado mientras se usan filtros o la búsqueda.
                    </div>
                )}
                 <div className="overflow-x-auto">
                    <table className="w-full text-base text-left text-slate-600 dark:text-slate-300">
                        <thead className="text-sm text-slate-700 uppercase bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
                            <tr>
                                <th scope="col" className="p-4 w-12 text-center" title="Reordenar">#</th>
                                <th scope="col" className="p-4">Vehículo</th>
                                <th scope="col" className="p-4 text-center">Vistas</th>
                                <th scope="col" className="p-4 text-center">Tasa Contacto</th>
                                <th scope="col" className="p-4 text-center">Destacado</th>
                                <th scope="col" className="p-4 text-center">Vendido</th>
                                <th scope="col" className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderedVehicles.map((vehicle, index) => {
                                const perf = performanceData.get(vehicle.id);
                                return (
                                <tr 
                                    key={vehicle.id} 
                                    className={`border-b dark:border-slate-700 ${vehicle.is_sold ? 'bg-slate-100 dark:bg-slate-800/30 opacity-60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'} ${isReorderEnabled ? 'cursor-grab' : ''}`}
                                    draggable={isReorderEnabled}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragEnter={() => handleDragEnter(index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <td className="p-4 text-slate-400 text-center">
                                        {isReorderEnabled ? <GripVerticalIcon className="inline-block" /> : <span>{index + 1}</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <img src={optimizeUrl(vehicle.images[0], { w: 80, h: 60, fit: 'cover' })} alt={`${vehicle.make} ${vehicle.model}`} className="w-20 h-15 object-cover rounded-md flex-shrink-0 bg-slate-200 dark:bg-slate-700"/>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">{vehicle.make} {vehicle.model}</p>
                                                <p className="text-sm text-slate-500">{vehicle.year} &middot; ${vehicle.price.toLocaleString('es-AR')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-semibold text-center">{perf?.views ?? 0}</td>
                                    <td className="p-4 font-semibold text-center">{perf?.contactRate ?? '0.0%'}</td>
                                    <td className="p-4 text-center">
                                         <button onClick={() => onToggleFeatured(vehicle.id, vehicle.is_featured)} disabled={vehicle.is_sold} className="disabled:opacity-30 disabled:cursor-not-allowed">
                                            <StarIcon className={`h-6 w-6 transition-colors ${vehicle.is_featured ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`} filled={vehicle.is_featured} />
                                         </button>
                                    </td>
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={vehicle.is_sold}
                                            onChange={() => onToggleSold(vehicle.id, vehicle.is_sold)}
                                            className="h-5 w-5 rounded border-gray-300 text-rago-burgundy focus:ring-rago-burgundy-darker dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setStatsModalVehicle(vehicle)} className="p-2 text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Ver Estadísticas"><EyeIcon /></button>
                                            <button onClick={() => onEdit(vehicle)} className="p-2 text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Editar"><EditIcon /></button>
                                            <button onClick={() => onDelete(vehicle.id)} className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Eliminar"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                 </div>
            </div>
             
             {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-red-800 dark:text-red-300">Zona de Peligro</h3>
                <p className="mt-1 text-red-600 dark:text-red-400">Estas acciones son irreversibles. Proceda con precaución.</p>
                <div className="mt-4">
                    <button
                        onClick={() => setResetAnalyticsModal(true)}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                    >
                        Reiniciar Estadísticas
                    </button>
                </div>
            </div>

            {statsModalVehicle && (
                <VehicleStatsModal 
                    vehicle={statsModalVehicle} 
                    allEvents={allEvents} 
                    onClose={() => setStatsModalVehicle(null)} 
                />
            )}
            
            {resetAnalyticsModal && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setResetAnalyticsModal(false)}
                    onConfirm={handleResetAnalytics}
                    title="Confirmar Reinicio de Estadísticas"
                    message="¿Estás seguro de que quieres borrar TODOS los datos de analíticas? Esta acción no se puede deshacer."
                    isConfirming={isResetting}
                />
            )}
        </div>
    );
};