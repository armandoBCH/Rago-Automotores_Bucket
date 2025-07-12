


import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Vehicle, AnalyticsEvent } from '../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, LogoutIcon, EyeIcon, ChatBubbleIcon, TargetIcon, StarIcon, CircleDollarSignIcon, GripVerticalIcon, FileCheckIcon, StatsIcon, ShareIcon, ArrowUpDownIcon, MessageSquareIcon, HeartIcon, MousePointerClickIcon } from '../constants';
import { optimizeUrl } from '../utils/image';
import ConfirmationModal from './ConfirmationModal';
import VehiclePerformanceTable from './VehiclePerformanceTable';

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

const TabButton: React.FC<{ name: string; icon: React.ReactNode; isActive: boolean; onClick: () => void }> = ({ name, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 whitespace-nowrap py-4 px-2 border-b-2 font-semibold text-lg transition-colors focus:outline-none ${
            isActive
                ? 'border-rago-burgundy text-rago-burgundy'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
    >
        {icon}
        {name}
    </button>
);

const InteractionCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-5">
            <div className="bg-rago-burgundy/10 text-rago-burgundy p-4 rounded-lg">
                {icon}
            </div>
            <div>
                <p className="text-4xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-base text-slate-500 dark:text-slate-400 mt-1">{title}</p>
            </div>
        </div>
    </div>
);

const KeyMetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-5">
            <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-700/50 text-rago-burgundy p-4 rounded-xl">
                {icon}
            </div>
            <div>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{value}</p>
                <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1">{title}</p>
            </div>
        </div>
    </div>
);

const RankItem: React.FC<{ vehicle: Vehicle; value: number | string; index: number; }> = ({ vehicle, value, index }) => (
    <li className="flex items-center justify-between gap-4 py-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
        <div className="flex items-center gap-4 min-w-0">
            <span className={`text-xl font-bold w-6 text-center ${index < 3 ? 'text-rago-burgundy' : 'text-slate-400'}`}>{index + 1}</span>
            <img src={optimizeUrl(vehicle.images[0], { w: 48, h: 36, fit: 'cover' })} alt={vehicle.model} className="w-12 h-9 object-cover rounded-md flex-shrink-0 bg-slate-200 dark:bg-slate-700" />
            <div className="min-w-0">
                <p className="font-semibold text-slate-800 dark:text-white truncate">{vehicle.make} {vehicle.model}</p>
                <p className="text-sm text-slate-500">{vehicle.year}</p>
            </div>
        </div>
        <span className="text-lg font-bold text-slate-900 dark:text-white flex-shrink-0">{value}</span>
    </li>
);

const RankingList: React.FC<{ title: string; data: { vehicle: Vehicle; value: number }[]; icon: React.ReactNode; }> = ({ title, data, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
            <span className="text-rago-burgundy">{icon}</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        {data.length > 0 ? (
            <ul className="space-y-1">
                {data.map((item, index) => <RankItem key={item.vehicle.id} vehicle={item.vehicle} value={item.value} index={index} />)}
            </ul>
        ) : (
            <p className="text-center py-8 text-slate-500">No hay datos.</p>
        )}
    </div>
);

const StatsView: React.FC<Pick<AdminPanelProps, 'vehicles' | 'allEvents' | 'onAnalyticsReset'>> = ({ vehicles, allEvents, onAnalyticsReset }) => {
    const [resetAnalyticsModal, setResetAnalyticsModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const { performanceData, kpis, rankings, keyInteractions } = useMemo(() => {
        const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
        const performanceMap = new Map<number, { views: number; contacts: number; shares: number; favorites: number; cardClicks: number }>();

        vehicles.forEach(v => {
            performanceMap.set(v.id, { views: 0, contacts: 0, shares: 0, favorites: 0, cardClicks: 0 });
        });

        allEvents.forEach(event => {
            if (event.vehicle_id && performanceMap.has(event.vehicle_id)) {
                const stats = performanceMap.get(event.vehicle_id)!;
                switch (event.event_type) {
                    case 'view_vehicle_detail': stats.views++; break;
                    case 'click_whatsapp_vehicle': stats.contacts++; break;
                    case 'click_share_vehicle': stats.shares++; break;
                    case 'favorite_add': stats.favorites++; break;
                    case 'click_card_details': stats.cardClicks++; break;
                }
            }
        });

        const fullPerformanceData = Array.from(performanceMap.entries()).map(([id, stats]) => {
            const vehicle = vehicleMap.get(id)!;
            return {
                vehicle,
                ...stats,
                contactRate: stats.views > 0 ? (stats.contacts / stats.views) * 100 : 0,
                ctr: stats.cardClicks > 0 ? (stats.views / stats.cardClicks) * 100 : 0 // Simplified CTR
            };
        });

        const siteKpis = {
            totalDetailViews: fullPerformanceData.reduce((acc, p) => acc + p.views, 0),
            totalCardClicks: fullPerformanceData.reduce((acc, p) => acc + p.cardClicks, 0),
            totalContacts: fullPerformanceData.reduce((acc, p) => acc + p.contacts, 0),
            totalFavorites: fullPerformanceData.reduce((acc, p) => acc + p.favorites, 0),
        };
        
        const siteRankings = {
            mostViewed: [...fullPerformanceData].sort((a,b) => b.views - a.views).slice(0, 5).map(p => ({ vehicle: p.vehicle, value: p.views })),
            mostContacted: [...fullPerformanceData].sort((a,b) => b.contacts - a.contacts).slice(0, 5).map(p => ({ vehicle: p.vehicle, value: p.contacts })),
            mostFavorited: [...fullPerformanceData].sort((a,b) => b.favorites - a.favorites).slice(0, 5).map(p => ({ vehicle: p.vehicle, value: p.favorites })),
        };
        
        const siteInteractions = {
            sellCarViews: allEvents.filter(e => e.event_type === 'view_sell_your_car').length,
            sellCarInterest: allEvents.filter(e => e.event_type === 'click_whatsapp_sell').length,
            generalContacts: allEvents.filter(e => e.event_type === 'click_whatsapp_general').length,
        };

        return { performanceData: fullPerformanceData, kpis: siteKpis, rankings: siteRankings, keyInteractions: siteInteractions };

    }, [vehicles, allEvents]);


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
        <div className="space-y-10 animate-fade-in">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KeyMetricCard title="Vistas a Detalles" value={kpis.totalDetailViews} icon={<EyeIcon className="h-8 w-8" />} />
                <KeyMetricCard title="Clics a Detalles" value={kpis.totalCardClicks} icon={<MousePointerClickIcon className="h-8 w-8" />} />
                <KeyMetricCard title="Contactos WhatsApp" value={kpis.totalContacts} icon={<MessageSquareIcon className="h-8 w-8" />} />
                <KeyMetricCard title="Guardados en Favoritos" value={kpis.totalFavorites} icon={<HeartIcon className="h-8 w-8" />} />
            </div>

            {/* Rankings */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Rankings de Vehículos</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <RankingList title="Más Vistos" data={rankings.mostViewed} icon={<EyeIcon className="h-6 w-6"/>} />
                    <RankingList title="Más Contactados" data={rankings.mostContacted} icon={<MessageSquareIcon className="h-6 w-6"/>} />
                    <RankingList title="Más Guardados" data={rankings.mostFavorited} icon={<HeartIcon className="h-6 w-6"/>} />
                </div>
            </div>
            
            {/* Full Performance Table */}
            <div>
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Rendimiento Detallado</h2>
                 <VehiclePerformanceTable performanceData={performanceData} />
            </div>


            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Interacciones Generales</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InteractionCard title="Vistas 'Vender mi Auto'" value={keyInteractions.sellCarViews} icon={<CircleDollarSignIcon className="h-8 w-8" />} />
                    <InteractionCard title="Interés en Vender" value={keyInteractions.sellCarInterest} icon={<FileCheckIcon className="h-8 w-8" />} />
                    <InteractionCard title="Contactos Generales" value={keyInteractions.generalContacts} icon={<ChatBubbleIcon className="h-8 w-8" />} />
                </div>
            </div>
             
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-red-800 dark:text-red-300">Zona de Peligro</h3>
                <p className="mt-1 text-red-600 dark:text-red-400">Esta acción es irreversible. Proceda con precaución.</p>
                <div className="mt-4">
                    <button
                        onClick={() => setResetAnalyticsModal(true)}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                    >
                        Reiniciar Estadísticas
                    </button>
                </div>
            </div>

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


const InventoryView: React.FC<Omit<AdminPanelProps, 'allEvents' | 'onAnalyticsReset'>> = ({ vehicles, onAdd, onEdit, onDelete, onToggleFeatured, onToggleSold, onReorder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [movePopover, setMovePopover] = useState<{ vehicleId: number | null; anchorEl: HTMLElement | null }>({ vehicleId: null, anchorEl: null });
    const [newPositionInput, setNewPositionInput] = useState('');
    const popoverRef = useRef<HTMLDivElement>(null);
    
    const filteredVehicles = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        if (lowercasedTerm) {
            return vehicles.filter(v => 
                `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(lowercasedTerm)
            );
        }
        return vehicles;
    }, [vehicles, searchTerm]);

    const [orderedVehicles, setOrderedVehicles] = useState(filteredVehicles);
    const dragItem = useRef<number | null>(null);

    useEffect(() => {
        setOrderedVehicles(filteredVehicles);
    }, [filteredVehicles]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                if (movePopover.anchorEl && !movePopover.anchorEl.contains(event.target as Node)) {
                    setMovePopover({ vehicleId: null, anchorEl: null });
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [movePopover.anchorEl]);

    const isReorderEnabled = searchTerm === '';

    const handleDragStart = (position: number) => dragItem.current = position;
    
    const handleDragEnter = (position: number) => {
        if (dragItem.current === null) return;
        const newOrderedVehicles = [...orderedVehicles];
        const draggedItemContent = newOrderedVehicles.splice(dragItem.current, 1)[0];
        newOrderedVehicles.splice(position, 0, draggedItemContent);
        dragItem.current = position;
        setOrderedVehicles(newOrderedVehicles);
    };

    const handleDragEnd = () => {
        if (dragItem.current !== null) onReorder(orderedVehicles);
        dragItem.current = null;
    };

    const handleMoveVehicle = () => {
        if (!movePopover.vehicleId) return;

        const position = parseInt(newPositionInput, 10);
        if (isNaN(position) || position < 1 || position > orderedVehicles.length) {
            alert(`Por favor, ingrese un número entre 1 y ${orderedVehicles.length}.`);
            return;
        }

        const targetIndex = position - 1;
        const currentIndex = orderedVehicles.findIndex(v => v.id === movePopover.vehicleId);

        if (currentIndex === -1 || currentIndex === targetIndex) {
            setMovePopover({ vehicleId: null, anchorEl: null });
            return;
        }

        const newOrderedVehicles = [...orderedVehicles];
        const [movedItem] = newOrderedVehicles.splice(currentIndex, 1);
        newOrderedVehicles.splice(targetIndex, 0, movedItem);

        onReorder(newOrderedVehicles);
        setMovePopover({ vehicleId: null, anchorEl: null });
    };

    const popoverPosition = useMemo(() => {
        if (!movePopover.anchorEl) return null;
        const rect = movePopover.anchorEl.getBoundingClientRect();
        return {
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX + rect.width / 2,
        };
    }, [movePopover.anchorEl]);

    return (
        <div className="relative bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Inventario</h2>
                 <div className="flex items-center gap-4 w-full md:w-auto flex-col sm:flex-row">
                     <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-base bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-rago-burgundy focus:border-transparent transition"
                        />
                    </div>
                    <button
                        onClick={onAdd}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 text-base font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all transform hover:-translate-y-px"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Añadir
                    </button>
                </div>
            </div>
            {!isReorderEnabled && (
                <div className="mb-4 p-3 text-sm text-center bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-500/50">
                    El reordenamiento manual está deshabilitado mientras se usa la búsqueda.
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-base text-left text-slate-600 dark:text-slate-300">
                    <thead className="text-sm text-slate-700 uppercase bg-slate-100 dark:bg-slate-700/50 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="p-4 w-12" title="Reordenar"></th>
                            <th scope="col" className="p-4">Vehículo</th>
                            <th scope="col" className="p-4 text-center">Estado</th>
                            <th scope="col" className="p-4">Precio</th>
                            <th scope="col" className="p-4 text-center">Destacado</th>
                            <th scope="col" className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderedVehicles.map((vehicle, index) => (
                            <tr 
                                key={vehicle.id} 
                                className={`border-b dark:border-slate-700/50 ${vehicle.is_sold ? 'opacity-60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'} ${isReorderEnabled ? 'cursor-grab' : ''}`}
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
                                        <img src={optimizeUrl(vehicle.images[0], { w: 96, h: 72, fit: 'cover' })} alt={`${vehicle.make} ${vehicle.model}`} className="w-24 h-16 object-cover rounded-md flex-shrink-0 bg-slate-200 dark:bg-slate-700"/>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{vehicle.make} {vehicle.model}</p>
                                            <p className="text-sm text-slate-500">{vehicle.year}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${vehicle.is_sold ? 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'}`}>
                                      {vehicle.is_sold ? 'Vendido' : 'Disponible'}
                                    </span>
                                </td>
                                <td className="p-4 font-semibold text-lg text-slate-700 dark:text-slate-200">${vehicle.price.toLocaleString('es-AR')}</td>
                                <td className="p-4 text-center">
                                     <button onClick={() => onToggleFeatured(vehicle.id, vehicle.is_featured)} disabled={vehicle.is_sold} className="disabled:opacity-30 disabled:cursor-not-allowed">
                                        <StarIcon className={`h-6 w-6 transition-colors ${vehicle.is_featured ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`} filled={vehicle.is_featured} />
                                     </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (movePopover.vehicleId === vehicle.id) {
                                                    setMovePopover({ vehicleId: null, anchorEl: null });
                                                } else {
                                                    setMovePopover({ vehicleId: vehicle.id, anchorEl: e.currentTarget });
                                                    setNewPositionInput(String(index + 1));
                                                }
                                            }}
                                            disabled={!isReorderEnabled}
                                            className="p-2 text-slate-500 hover:text-purple-500 dark:hover:text-purple-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Mover a posición"
                                        >
                                            <ArrowUpDownIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => onToggleSold(vehicle.id, vehicle.is_sold)} className="p-2 text-slate-500 hover:text-green-500 dark:hover:text-green-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" title={vehicle.is_sold ? 'Marcar como disponible' : 'Marcar como vendido'}><CircleDollarSignIcon className="h-5 w-5"/></button>
                                        <button onClick={() => onEdit(vehicle)} className="p-2 text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" title="Editar"><EditIcon /></button>
                                        <button onClick={() => onDelete(vehicle.id)} className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" title="Eliminar"><TrashIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {orderedVehicles.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-12 text-slate-500">No se encontraron vehículos.</td></tr>
                        )}
                    </tbody>
                </table>
             </div>
             {movePopover.anchorEl && popoverPosition && (
                 <div
                    ref={popoverRef}
                    className="absolute z-20 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4 animate-fade-in"
                    style={{
                        top: `${popoverPosition.top}px`,
                        left: `${popoverPosition.left}px`,
                        transform: 'translateX(-50%)',
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <p className="text-sm font-semibold mb-2 text-slate-800 dark:text-slate-100">Mover a la posición</p>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={newPositionInput}
                            onChange={e => setNewPositionInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleMoveVehicle();
                                    e.preventDefault();
                                }
                            }}
                            min="1"
                            max={orderedVehicles.length}
                            className="w-full px-2 py-1 text-base bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-rago-burgundy focus:border-transparent transition"
                            autoFocus
                        />
                        <button
                            onClick={handleMoveVehicle}
                            className="px-4 py-1 text-sm font-semibold text-white bg-rago-burgundy rounded-md hover:bg-rago-burgundy-darker"
                        >
                            Mover
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'stats'>('inventory');

    return (
        <div className="bg-slate-100 dark:bg-slate-900/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 min-h-[85vh]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Panel de Administración</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">Gestioná tu inventario y analizá las estadísticas.</p>
                </div>
                <button
                    onClick={props.onLogout}
                    className="flex items-center gap-2 px-4 py-2 text-base font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all flex-shrink-0"
                >
                    <LogoutIcon className="h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>
            
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton name="Inventario" icon={<FileCheckIcon className="h-6 w-6"/>} isActive={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
                    <TabButton name="Estadísticas" icon={<StatsIcon className="h-6 w-6"/>} isActive={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                </nav>
            </div>
            
            <div className="mt-8">
                {activeTab === 'inventory' && <InventoryView {...props} />}
                {activeTab === 'stats' && <StatsView {...props} />}
            </div>
        </div>
    );
};