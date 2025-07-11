import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, AnalyticsEvent } from '../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, LogoutIcon, EyeIcon, ChatBubbleIcon as WhatsAppIcon, FileCheckIcon, SellCarIcon, ShareIcon, InstagramIcon, StarIcon, CircleDollarSignIcon, GripVerticalIcon } from '../constants';
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

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl flex items-center gap-5">
        <div className="bg-rago-burgundy/10 text-rago-burgundy dark:bg-rago-burgundy/20 dark:text-rago-burgundy p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-base text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const AnalyticsDashboard: React.FC<{ vehicles: Vehicle[], events: AnalyticsEvent[], onReset: () => void }> = ({ vehicles, events, onReset }) => {
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [resetError, setResetError] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const analyticsSummary = useMemo(() => {
        const viewCounts: { [key: number]: number } = {};
        const contactCounts: { [key: number]: number } = {};
        const shareCounts: { [key: number]: number } = {};
        
        let totalVehicleViews = 0, totalVehicleContacts = 0, totalGeneralContacts = 0, totalShares = 0, sellCarViews = 0, sellCarQuoteClicks = 0, instagramClicks = 0, sellCarHeaderClicks = 0;

        events.forEach(event => {
            if (event.event_type === 'view_vehicle' && event.vehicle_id) { totalVehicleViews++; viewCounts[event.vehicle_id] = (viewCounts[event.vehicle_id] || 0) + 1; }
            else if (event.event_type === 'click_whatsapp' && event.vehicle_id) { totalVehicleContacts++; contactCounts[event.vehicle_id] = (contactCounts[event.vehicle_id] || 0) + 1; }
            else if (['click_whatsapp_general', 'click_phone_footer'].includes(event.event_type)) { totalGeneralContacts++; }
            else if (event.event_type === 'view_sell_your_car') { sellCarViews++; }
            else if (event.event_type === 'click_whatsapp_sell') { sellCarQuoteClicks++; }
            else if (event.event_type === 'click_share' && event.vehicle_id) { totalShares++; shareCounts[event.vehicle_id] = (shareCounts[event.vehicle_id] || 0) + 1; }
            else if (event.event_type === 'click_instagram') { instagramClicks++; }
            else if (event.event_type === 'click_sell_car_header') { sellCarHeaderClicks++; }
        });

        const getVehicle = (id: number) => vehicles.find(v => v.id === id);
        const mostViewed = Object.entries(viewCounts).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ vehicle: getVehicle(Number(id)), count })).filter(item => item.vehicle).slice(0, 5);
        const mostContacted = Object.entries(contactCounts).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ vehicle: getVehicle(Number(id)), count })).filter(item => item.vehicle).slice(0, 5);
        const mostShared = Object.entries(shareCounts).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ vehicle: getVehicle(Number(id)), count })).filter(item => item.vehicle).slice(0, 5);

        return { totalVehicleViews, totalVehicleContacts, totalGeneralContacts, totalShares, sellCarViews, sellCarQuoteClicks, sellCarHeaderClicks, instagramClicks, mostViewed, mostContacted, mostShared };
    }, [events, vehicles]);

    const handleResetClick = () => { setShowResetConfirm(true); };
    const handleResetConfirm = () => { setShowResetConfirm(false); setShowPasswordModal(true); };

    const handleFinalReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResetting(true); setResetError('');
        try {
            const response = await fetch('/api/reset-analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error');
            setShowPasswordModal(false); setPassword(''); onReset();
        } catch (err: any) { setResetError(err.message); }
        finally { setIsResetting(false); }
    };
    
    const RankingList: React.FC<{ title: string, data: { vehicle?: Vehicle, count: number }[], icon: React.ReactNode }> = ({ title, data, icon }) => (
         <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-lg"><h3 className="text-xl font-bold mb-4">{title}</h3>
            {data.length > 0 ? (<ul className="space-y-4">{data.map(({ vehicle, count }) => vehicle && (
                <li key={vehicle.id} className="flex items-center gap-4">
                    <img src={optimizeUrl(vehicle.images[0], {w: 64, h: 48, fit: 'cover'})} alt={vehicle.model} className="w-16 h-12 object-cover rounded-md" />
                    <div className="flex-grow min-w-0"><p className="font-semibold truncate">{vehicle.make} {vehicle.model}</p><p className="text-sm text-slate-500">{vehicle.year}</p></div>
                    <div className="flex items-center gap-2 font-bold text-lg">{icon}<span>{count}</span></div>
                </li>
            ))}</ul>) : <p className="text-slate-500">No hay datos.</p>}
        </div>
    );

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold">Resumen General</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard title="Vistas de Vehículos" value={analyticsSummary.totalVehicleViews} icon={<EyeIcon className="h-7 w-7"/>} />
                <StatCard title="Contactos por Vehículo" value={analyticsSummary.totalVehicleContacts} icon={<WhatsAppIcon className="h-7 w-7"/>} />
                <StatCard title="Veces Compartido" value={analyticsSummary.totalShares} icon={<ShareIcon className="h-7 w-7"/>} />
                <StatCard title="Clics en Instagram" value={analyticsSummary.instagramClicks} icon={<InstagramIcon className="h-7 w-7"/>} />
            </div>
            
            <h3 className="text-2xl font-bold mt-12">Rendimiento por Vehículo</h3>
            <VehiclePerformanceTable vehicles={vehicles} events={events} />

            <h3 className="text-2xl font-bold mt-12">Rankings</h3>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <RankingList title="Más Vistos" data={analyticsSummary.mostViewed} icon={<EyeIcon className="h-5 w-5" />} />
                <RankingList title="Más Contactados" data={analyticsSummary.mostContacted} icon={<WhatsAppIcon className="h-5 w-5" />} />
                <RankingList title="Más Compartidos" data={analyticsSummary.mostShared} icon={<ShareIcon className="h-5 w-5" />} />
            </div>

            <h3 className="text-2xl font-bold mt-12">Interacciones Clave</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Vistas 'Vender mi Auto'" value={analyticsSummary.sellCarViews} icon={<SellCarIcon className="h-7 w-7"/>} />
                <StatCard title="Interés en Vender" value={analyticsSummary.sellCarQuoteClicks + analyticsSummary.sellCarHeaderClicks} icon={<FileCheckIcon className="h-7 w-7"/>} />
                <StatCard title="Contactos Generales" value={analyticsSummary.totalGeneralContacts} icon={<WhatsAppIcon className="h-7 w-7"/>} />
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-red-600">Zona de Peligro</h3>
                <p className="text-slate-500 mt-1">Esta acción es irreversible.</p>
                <button onClick={handleResetClick} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-base font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"><TrashIcon/>Reiniciar Estadísticas</button>
            </div>
            <ConfirmationModal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} onConfirm={handleResetConfirm} title="¿Estás seguro?" message="Se borrarán TODAS las estadísticas."/>
            {showPasswordModal && <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-[60] p-4" onClick={() => setShowPasswordModal(false)}><div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
                <h3 className="text-xl font-semibold">Confirmación Final</h3><p className="mt-2">Ingresa tu contraseña de administrador.</p>
                <form onSubmit={handleFinalReset} className="mt-4 space-y-4">
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-rago-burgundy" placeholder="Contraseña" />
                    {resetError && <p className="text-sm text-red-500">{resetError}</p>}
                    <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 font-medium bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">Cancelar</button><button type="submit" disabled={isResetting} className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400 flex items-center gap-2">
                        {isResetting && <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                        {isResetting ? 'Borrando...' : 'Confirmar'}
                    </button></div>
                </form>
            </div></div>}
        </div>
    );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ vehicles, allEvents, onAdd, onEdit, onDelete, onLogout, onAnalyticsReset, onToggleFeatured, onToggleSold, onReorder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'inventory' | 'analytics'>('inventory');
    const [orderedVehicles, setOrderedVehicles] = useState(vehicles);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    useEffect(() => {
        setOrderedVehicles(vehicles);
    }, [vehicles]);

    const filteredVehicles = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        // If searching, use the original `vehicles` prop to filter from the full list
        const sourceList = term ? vehicles : orderedVehicles;
        return term ? sourceList.filter(v => `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(term)) : sourceList;
    }, [vehicles, orderedVehicles, searchTerm]);
    
    const isSearching = searchTerm.trim() !== '';

    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (index: number) => {
        if (draggedItemIndex === null || draggedItemIndex === index) return;
        const newItems = [...orderedVehicles];
        const [draggedItem] = newItems.splice(draggedItemIndex, 1);
        newItems.splice(index, 0, draggedItem);
        setDraggedItemIndex(index);
        setOrderedVehicles(newItems);
    };

    const handleDragEnd = () => {
        if (draggedItemIndex !== null) {
            onReorder(orderedVehicles);
        }
        setDraggedItemIndex(null);
    };

    const TabButton: React.FC<{ tabId: 'inventory' | 'analytics', children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-5 py-3 font-semibold text-lg relative transition-colors duration-300 ${
                activeTab === tabId
                    ? 'text-rago-burgundy'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
            {children}
            {activeTab === tabId && <span className="absolute bottom-0 left-4 right-4 h-1 bg-rago-burgundy rounded-t-full"></span>}
        </button>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-4xl font-black text-slate-800 dark:text-white">Panel de Administración</h1>
                <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2.5 font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors" aria-label="Cerrar sesión">
                    <LogoutIcon className="h-5 w-5" /><span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-2">
                    <TabButton tabId="inventory">Inventario</TabButton>
                    <TabButton tabId="analytics">Estadísticas</TabButton>
                </div>
                
                <div className="p-4 sm:p-6">
                    {activeTab === 'inventory' && (
                        <>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h2 className="text-3xl font-bold">Gestión de Inventario</h2>
                                <div className="w-full sm:w-auto flex items-stretch gap-3">
                                    <div className="flex-grow sm:w-64 relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="h-5 w-5 text-gray-400" /></span><input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-lg focus:ring-2 focus:ring-rago-burgundy" aria-label="Buscar vehículo"/></div>
                                    <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 font-medium text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker shadow-md hover:shadow-lg transition-all transform hover:-translate-y-px"><PlusIcon/>Añadir</button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-base text-left">
                                    <thead className="text-sm text-slate-500 dark:text-slate-400 uppercase border-b-2 border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th scope="col" className="w-12 px-2 py-4"></th>
                                            <th scope="col" className="px-6 py-4 font-semibold">Vehículo</th>
                                            <th scope="col" className="px-6 py-4 font-semibold">Estado</th>
                                            <th scope="col" className="px-6 py-4 font-semibold">Precio</th>
                                            <th scope="col" className="px-6 py-4 font-semibold text-center">Destacado</th>
                                            <th scope="col" className="px-6 py-4 font-semibold">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVehicles.map((vehicle, index) => (
                                            <tr 
                                                key={vehicle.id} 
                                                draggable={!isSearching}
                                                onDragStart={!isSearching ? (e) => handleDragStart(e, index) : undefined}
                                                onDragEnter={!isSearching ? () => handleDragEnter(index) : undefined}
                                                onDragEnd={!isSearching ? handleDragEnd : undefined}
                                                onDragOver={!isSearching ? (e) => e.preventDefault() : undefined}
                                                className={`border-b dark:border-slate-800 transition-colors duration-200 ${vehicle.is_sold ? 'bg-slate-100/50 dark:bg-slate-800/30 opacity-60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'} ${draggedItemIndex === index ? 'opacity-50 scale-105 shadow-2xl' : ''}`}
                                            >
                                                <td className="px-2 py-4">
                                                    {!isSearching && (
                                                        <div className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-grab active:cursor-grabbing">
                                                            <GripVerticalIcon className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </td>
                                                <th scope="row" className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                                    <div className='flex items-center gap-4'>
                                                        <img src={optimizeUrl(vehicle.images?.[0], { w: 80, h: 64, fit: 'cover' })} alt={`${vehicle.make} ${vehicle.model}`} className="w-20 h-16 object-cover rounded-md" />
                                                        <span>{vehicle.make} {vehicle.model} ({vehicle.year})</span>
                                                    </div>
                                                </th>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${vehicle.is_sold ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'}`}>
                                                        {vehicle.is_sold ? 'Vendido' : 'Disponible'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">${vehicle.price.toLocaleString('es-AR')}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => onToggleFeatured(vehicle.id, vehicle.is_featured)} disabled={vehicle.is_sold} className={`p-2 rounded-full transition-colors ${vehicle.is_featured ? 'text-amber-400 hover:text-amber-500' : 'text-slate-400 dark:text-slate-500 hover:text-amber-400 dark:hover:text-amber-400'} disabled:opacity-30 disabled:cursor-not-allowed`} aria-label="Destacar vehículo">
                                                        <StarIcon className="h-7 w-7" filled={vehicle.is_featured} />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-x-2">
                                                        <button onClick={() => onToggleSold(vehicle.id, vehicle.is_sold)} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-green-600 dark:hover:bg-slate-700 dark:hover:text-green-400 transition-colors" title={vehicle.is_sold ? 'Marcar como disponible' : 'Marcar como vendido'}>
                                                            <CircleDollarSignIcon className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => onEdit(vehicle)} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-sky-600 dark:hover:bg-slate-700 dark:hover:text-sky-400 transition-colors"><EditIcon className="h-5 w-5" /></button>
                                                        <button onClick={() => onDelete(vehicle.id)} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-500 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredVehicles.length === 0 && <div className="text-center py-12 text-gray-500">{vehicles.length === 0 ? "No hay vehículos." : `No se encontraron vehículos para "${searchTerm}".`}</div>}
                        </>
                    )}
                    {activeTab === 'analytics' && <AnalyticsDashboard vehicles={vehicles} events={allEvents} onReset={onAnalyticsReset} />}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;