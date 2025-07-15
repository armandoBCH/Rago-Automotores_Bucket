
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Vehicle, AnalyticsEvent, FinancingSettings, Review, ReviewUpdate } from '../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, LogoutIcon, EyeIcon, MessageSquareIcon, TargetIcon, StarIcon, CircleDollarSignIcon, GripVerticalIcon, FileCheckIcon, StatsIcon, ShareIcon, ArrowUpDownIcon, HeartIcon, MousePointerClickIcon, GlobeIcon, SettingsIcon, ReviewIcon, MessageCircleIcon as AdminReplyIcon, ChatBubbleIcon } from '../constants';
import { optimizeUrl } from '../utils/image';
import ConfirmationModal from './ConfirmationModal';
import VehiclePerformanceTable from './VehiclePerformanceTable';
import StarRating from './StarRating';

interface AdminPanelProps {
    vehicles: Vehicle[];
    allEvents: AnalyticsEvent[];
    financingSettings: FinancingSettings | null;
    onAdd: () => void;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (vehicleId: number) => void;
    onLogout: () => void;
    onDataRefresh: () => void;
    onToggleFeatured: (vehicleId: number, currentStatus: boolean) => void;
    onToggleSold: (vehicleId: number, currentStatus: boolean) => void;
    onReorder: (reorderedVehicles: Vehicle[]) => void;
    authHeaders: Record<string, string>;
}

const TabButton: React.FC<{ name: string; icon: React.ReactNode; isActive: boolean; onClick: () => void }> = ({ name, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 sm:gap-3 flex-shrink-0 py-3 px-1 sm:px-2 border-b-2 font-semibold text-base sm:text-lg transition-colors focus:outline-none ${
            isActive
                ? 'border-rago-burgundy text-rago-burgundy'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
    >
        {icon}
        {name}
    </button>
);

const KeyMetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-700/50 text-rago-burgundy p-3 sm:p-4 rounded-xl">
                {icon}
            </div>
            <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{value}</p>
                <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 mt-1">{title}</p>
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
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
            <span className="text-rago-burgundy">{icon}</span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
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

type DateRange = '7d' | '30d' | 'all';
const DateRangeButton: React.FC<{ label: string; range: DateRange; activeRange: DateRange; onClick: (range: DateRange) => void; }> = ({ label, range, activeRange, onClick }) => {
    const isActive = range === activeRange;
    return (
        <button
            onClick={() => onClick(range)}
            className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-colors duration-200 ${isActive ? 'bg-rago-burgundy text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
        >
            {label}
        </button>
    );
};

const AnalyticsChart: React.FC<{ data: { date: string; views: number }[] }> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<{ x: number, y: number, date: string, views: number } | null>(null);

    const chartHeight = 250;
    const chartPadding = { top: 20, right: 20, bottom: 50, left: 50 };
    const chartWidth = 800;

    const maxValue = Math.max(...data.map(d => d.views), 1);
    const yAxisTicks = 5;
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00'); // Ensure it's parsed as local time
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    };
    
    const handleMouseMove = (e: React.MouseEvent<SVGRectElement>, index: number) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const barData = data[index];
        setTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            date: barData.date,
            views: barData.views,
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-subtle dark:shadow-subtle-dark border border-slate-200 dark:border-slate-800 relative">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">Actividad Diaria (Vistas)</h3>
            {data.length === 0 ? (
                 <div className="flex items-center justify-center h-[300px] text-slate-500">
                    No hay datos de actividad para este período.
                </div>
            ) : (
                <div className="relative overflow-x-auto">
                    <svg ref={svgRef} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[600px]" onMouseLeave={() => setTooltip(null)}>
                        {/* Y-axis */}
                        {Array.from({ length: yAxisTicks + 1 }).map((_, i) => {
                            const y = chartPadding.top + (i * (chartHeight - chartPadding.top - chartPadding.bottom)) / yAxisTicks;
                            const value = Math.round(maxValue * (1 - i / yAxisTicks));
                            return (
                                <g key={`y-axis-${i}`}>
                                    <line x1={chartPadding.left} y1={y} x2={chartWidth - chartPadding.right} y2={y} stroke="currentColor" className="text-slate-200 dark:text-slate-700/50" />
                                    <text x={chartPadding.left - 8} y={y + 4} textAnchor="end" className="text-xs fill-slate-500 dark:fill-slate-400">{value}</text>
                                </g>
                            );
                        })}
    
                        {/* Bars and X-axis */}
                        {data.map((item, index) => {
                            const barWidth = (chartWidth - chartPadding.left - chartPadding.right) / data.length;
                            const x = chartPadding.left + index * barWidth;
                            const barHeight = Math.max(0, (item.views / maxValue) * (chartHeight - chartPadding.top - chartPadding.bottom));
                            const y = chartHeight - chartPadding.bottom - barHeight;
                            
                            return (
                                <g key={item.date}>
                                    <rect
                                        x={x + barWidth * 0.1}
                                        y={y}
                                        width={barWidth * 0.8}
                                        height={barHeight}
                                        className="fill-rago-burgundy/60 hover:fill-rago-burgundy transition-colors"
                                        onMouseMove={(e) => handleMouseMove(e, index)}
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                    <text x={x + barWidth / 2} y={chartHeight - chartPadding.bottom + 15} textAnchor="middle" className="text-xs fill-slate-500 dark:fill-slate-400">
                                        {formatDate(item.date)}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                    {tooltip && (
                        <div className="absolute p-2 text-sm bg-slate-900 dark:bg-slate-800 text-white rounded-md shadow-lg pointer-events-none" style={{ top: tooltip.y - 50, left: tooltip.x + 10 }}>
                           <p className="font-bold">{new Date(tooltip.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                           <p>{tooltip.views} {tooltip.views === 1 ? 'vista' : 'vistas'}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const StatsView: React.FC<Pick<AdminPanelProps, 'vehicles' | 'allEvents' | 'onDataRefresh' | 'onLogout' | 'authHeaders'>> = ({ vehicles, allEvents, onDataRefresh, onLogout, authHeaders }) => {
    const [resetAnalyticsModal, setResetAnalyticsModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange>('7d');
    
    const dateRangeLabel = useMemo(() => {
        switch (dateRange) {
            case '7d': return 'Últimos 7 días';
            case '30d': return 'Últimos 30 días';
            case 'all': return 'Historial completo';
        }
    }, [dateRange]);

    const filteredEvents = useMemo(() => {
        if (dateRange === 'all') return allEvents;
        const now = new Date();
        const daysToSubtract = dateRange === '7d' ? 7 : 30;
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract + 1);
        
        return allEvents.filter(event => new Date(event.created_at) >= startDate);
    }, [allEvents, dateRange]);


    const { performanceData, kpis, rankings, keyInteractions, chartData } = useMemo(() => {
        const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
        const performanceMap = new Map<number, { views: number; contacts: number; shares: number; favorites: number; cardClicks: number }>();

        vehicles.forEach(v => {
            performanceMap.set(v.id, { views: 0, contacts: 0, shares: 0, favorites: 0, cardClicks: 0 });
        });

        const dailyActivity = new Map<string, { views: number }>();
        
        if (dateRange !== 'all') {
            const days = dateRange === '7d' ? 7 : 30;
            for (let i = 0; i < days; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateString = d.toISOString().split('T')[0];
                dailyActivity.set(dateString, { views: 0 });
            }
        }

        filteredEvents.forEach(event => {
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

            if(event.event_type === 'view_vehicle_detail') {
                 const dateString = new Date(event.created_at).toISOString().split('T')[0];
                 if (dailyActivity.has(dateString)) {
                     dailyActivity.get(dateString)!.views++;
                 } else if (dateRange === 'all') {
                     dailyActivity.set(dateString, { views: 1 });
                 }
            }
        });

        const fullPerformanceData = Array.from(performanceMap.entries()).map(([id, stats]) => {
            const vehicle = vehicleMap.get(id)!;
            return {
                vehicle,
                ...stats,
                contactRate: stats.views > 0 ? (stats.contacts / stats.views) * 100 : 0,
            };
        });

        const siteKpis = {
            totalPageViews: filteredEvents.filter(e => e.event_type === 'page_view').length,
            totalDetailViews: fullPerformanceData.reduce((acc, p) => acc + p.views, 0),
            totalCardClicks: fullPerformanceData.reduce((acc, p) => acc + p.cardClicks, 0),
            totalContacts: fullPerformanceData.reduce((acc, p) => acc + p.contacts, 0),
            totalFavorites: allEvents.filter(e => e.event_type === 'favorite_add').length - allEvents.filter(e => e.event_type === 'favorite_remove').length,
        };
        
        const siteRankings = {
            mostViewed: [...fullPerformanceData].sort((a,b) => b.views - a.views).slice(0, 5).map(p => ({ vehicle: p.vehicle, value: p.views })),
            mostContacted: [...fullPerformanceData].sort((a,b) => b.contacts - a.contacts).slice(0, 5).map(p => ({ vehicle: p.vehicle, value: p.contacts })),
            mostFavorited: [...fullPerformanceData].sort((a,b) => b.favorites - a.favorites).slice(0, 5).map(p => ({ vehicle: p.vehicle, value: p.favorites })),
        };
        
        const siteInteractions = {
            sellCarViews: filteredEvents.filter(e => e.event_type === 'view_sell_your_car').length,
            sellCarInterest: filteredEvents.filter(e => e.event_type === 'click_whatsapp_sell').length,
            generalContacts: filteredEvents.filter(e => e.event_type === 'click_whatsapp_general').length,
        };

        const sortedChartData = Array.from(dailyActivity.entries())
            .map(([date, data]) => ({ date, views: data.views }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return { performanceData: fullPerformanceData, kpis: siteKpis, rankings: siteRankings, keyInteractions: siteInteractions, chartData: sortedChartData };

    }, [vehicles, filteredEvents, dateRange, allEvents]);


    const handleResetAnalytics = async () => {
        setIsResetting(true);
        try {
            const response = await fetch('/api/analytics', {
                method: 'DELETE',
                headers: authHeaders,
            });
            if (response.status === 401) return onLogout();
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al reiniciar las estadísticas.');
            alert('Estadísticas reiniciadas con éxito.');
            onDataRefresh();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsResetting(false);
            setResetAnalyticsModal(false);
        }
    };
    
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Mostrando estadísticas: <span className="text-rago-burgundy">{dateRangeLabel}</span></h2>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                    <DateRangeButton label="7 días" range="7d" activeRange={dateRange} onClick={setDateRange} />
                    <DateRangeButton label="30 días" range="30d" activeRange={dateRange} onClick={setDateRange} />
                    <DateRangeButton label="Todo" range="all" activeRange={dateRange} onClick={setDateRange} />
                </div>
            </div>
            <AnalyticsChart data={chartData} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <KeyMetricCard title="Vistas de Página" value={kpis.totalPageViews} icon={<GlobeIcon className="h-7 w-7 sm:h-8 sm:w-8" />} />
                <KeyMetricCard title="Vistas a Detalles" value={kpis.totalDetailViews} icon={<EyeIcon className="h-7 w-7 sm:h-8 sm:w-8" />} />
                <KeyMetricCard title="Clics a Detalles" value={kpis.totalCardClicks} icon={<MousePointerClickIcon className="h-7 w-7 sm:h-8 sm:w-8" />} />
                <KeyMetricCard title="Contactos WhatsApp" value={kpis.totalContacts} icon={<MessageSquareIcon className="h-7 w-7 sm:h-8 sm:w-8" />} />
                <KeyMetricCard title="Favoritos (Neto)" value={kpis.totalFavorites} icon={<HeartIcon className="h-7 w-7 sm:h-8 sm:w-8" />} />
            </div>
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">Rankings de Vehículos</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <RankingList title="Más Vistos" data={rankings.mostViewed} icon={<EyeIcon className="h-6 w-6"/>} />
                    <RankingList title="Más Contactados" data={rankings.mostContacted} icon={<MessageSquareIcon className="h-6 w-6"/>} />
                    <RankingList title="Más Guardados" data={rankings.mostFavorited} icon={<HeartIcon className="h-6 w-6"/>} />
                </div>
            </div>
            <div>
                 <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">Rendimiento Detallado</h2>
                 <VehiclePerformanceTable performanceData={performanceData} />
            </div>
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">Interacciones Generales</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KeyMetricCard title="Vistas 'Vender mi Auto'" value={keyInteractions.sellCarViews} icon={<CircleDollarSignIcon className="h-7 w-7 sm:h-8 sm:w-8" />} />
                    <KeyMetricCard title="Interés en Vender" value={keyInteractions.sellCarInterest} icon={<FileCheckIcon className="h-7 w-7 sm:h-8 sm:w-8" />} />
                    <KeyMetricCard title="Contactos Generales" value={keyInteractions.generalContacts} icon={<ChatBubbleIcon className="h-7 w-7 sm:h-8 sm:w-8" />} />
                </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-red-800 dark:text-red-300">Zona de Peligro</h3>
                <p className="mt-1 text-red-600 dark:text-red-400">Esta acción es irreversible y reiniciará TODO el historial de estadísticas.</p>
                <div className="mt-4">
                    <button
                        onClick={() => setResetAnalyticsModal(true)}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 dark:focus:ring-offset-slate-900 focus:ring-red-600"
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

const InventoryView: React.FC<Omit<AdminPanelProps, 'allEvents' | 'financingSettings' | 'onDataRefresh' | 'authHeaders'>> = ({ vehicles, onAdd, onEdit, onDelete, onToggleFeatured, onToggleSold, onReorder }) => {
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
        return () => document.removeEventListener("mousedown", handleClickOutside);
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
        return { top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX + rect.width / 2 };
    }, [movePopover.anchorEl]);

    return (
        <div className="relative bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                 <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Gestión de Inventario</h2>
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
                    <button onClick={onAdd} className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 text-base font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all transform hover:-translate-y-px">
                        <PlusIcon className="h-5 w-5" /> Añadir
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
                            <tr key={vehicle.id} className={`border-b dark:border-slate-700/50 ${vehicle.is_sold ? 'opacity-60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'} ${isReorderEnabled ? 'cursor-grab' : ''}`} draggable={isReorderEnabled} onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}>
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
                                    <div className="flex items-center justify-end gap-1 flex-wrap">
                                        <button onClick={(e) => { e.stopPropagation(); if (movePopover.vehicleId === vehicle.id) { setMovePopover({ vehicleId: null, anchorEl: null }); } else { setMovePopover({ vehicleId: vehicle.id, anchorEl: e.currentTarget }); setNewPositionInput(String(index + 1)); } }} disabled={!isReorderEnabled} className="p-2 text-slate-500 hover:text-purple-500 dark:hover:text-purple-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Mover a posición">
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
                 <div ref={popoverRef} className="absolute z-20 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4 animate-fade-in" style={{ top: `${popoverPosition.top}px`, left: `${popoverPosition.left}px`, transform: 'translateX(-50%)' }} onClick={e => e.stopPropagation()}>
                    <p className="text-sm font-semibold mb-2 text-slate-800 dark:text-slate-100">Mover a la posición</p>
                    <div className="flex gap-2">
                        <input type="number" value={newPositionInput} onChange={e => setNewPositionInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { handleMoveVehicle(); e.preventDefault(); } }} min="1" max={orderedVehicles.length} className="w-full px-2 py-1 text-base bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-rago-burgundy focus:border-transparent transition" autoFocus />
                        <button onClick={handleMoveVehicle} className="px-4 py-1 text-sm font-semibold text-white bg-rago-burgundy rounded-md hover:bg-rago-burgundy-darker"> Mover </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SettingsView: React.FC<Pick<AdminPanelProps, 'financingSettings' | 'onDataRefresh' | 'onLogout' | 'authHeaders'>> = ({ financingSettings, onDataRefresh, onLogout, authHeaders }) => {
    const [settings, setSettings] = useState(financingSettings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSettings(financingSettings);
    }, [financingSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = name === 'interest_rate' ? parseFloat(value) : parseInt(value, 10);
        setSettings(prev => prev ? { ...prev, [name]: numValue } : null);
    };

    const handleSave = async () => {
        if (!settings) return;
        
        setIsSaving(true);
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({ settings: {
                    max_amount: settings.max_amount,
                    max_installments: settings.max_installments,
                    interest_rate: settings.interest_rate,
                } }),
            });
            if (response.status === 401) return onLogout();
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al guardar.');
            alert('Configuración guardada con éxito.');
            onDataRefresh();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!settings) return <div className="text-center py-10">Cargando configuración...</div>

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Configuración de Financiación</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="max_amount" className="block text-base font-medium text-gray-700 dark:text-gray-300">Monto Máximo a Financiar (ARS)</label>
                        <input type="number" name="max_amount" id="max_amount" value={settings.max_amount} onChange={handleChange} className="mt-1 form-input"/>
                    </div>
                    <div>
                        <label htmlFor="max_installments" className="block text-base font-medium text-gray-700 dark:text-gray-300">Máximo de Cuotas</label>
                        <input type="number" name="max_installments" id="max_installments" value={settings.max_installments} onChange={handleChange} className="mt-1 form-input"/>
                    </div>
                     <div>
                        <label htmlFor="interest_rate" className="block text-base font-medium text-gray-700 dark:text-gray-300">Tasa de Interés Mensual (ej: 0.03 para 3%)</label>
                        <input type="number" name="interest_rate" id="interest_rate" step="0.001" value={settings.interest_rate} onChange={handleChange} className="mt-1 form-input"/>
                    </div>
                    <div className="pt-4 text-right">
                         <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 text-base font-semibold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker disabled:opacity-50">
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.375rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
        </div>
    )
}

const ReviewsView: React.FC<{vehicles: Vehicle[], onDataRefresh: () => void, onLogout: () => void, authHeaders: Record<string, string>}> = ({ vehicles, onDataRefresh, onLogout, authHeaders }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState<Review | null>(null);

    const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);
    
    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/reviews?admin=true', { headers: authHeaders });
            if (response.status === 401) return onLogout();
            if(!response.ok) throw new Error("Failed to fetch reviews");
            const data = await response.json();
            setReviews(data.reviews || []);
        } catch (error) {
            console.error(error);
            alert("No se pudieron cargar las reseñas.");
        } finally {
            setLoading(false);
        }
    }, [authHeaders, onLogout]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleUpdate = async (reviewId: number, update: ReviewUpdate) => {
        try {
            const response = await fetch('/api/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({ reviewId, update }),
            });
            if (response.status === 401) return onLogout();
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al actualizar.');
            fetchReviews();
            if (editingReview?.id === reviewId) setEditingReview(null);
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };
    
    const handleDelete = async (reviewId: number) => {
        if(confirm("¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.")) {
             try {
                const response = await fetch('/api/reviews', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', ...authHeaders },
                    body: JSON.stringify({ reviewId }),
                });
                if (response.status === 401) return onLogout();
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Error al eliminar.');
                fetchReviews();
             } catch (err: any) {
                 alert(`Error: ${err.message}`);
             }
        }
    }

    if (loading) return <div className="text-center py-10">Cargando reseñas...</div>;

    return (
        <div className="animate-fade-in bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Gestión de Reseñas</h2>
            {editingReview && <EditReviewModal review={editingReview} vehicle={vehicleMap.get(editingReview.vehicle_id)} onClose={() => setEditingReview(null)} onSave={handleUpdate} />}
            <div className="overflow-x-auto">
                <table className="w-full text-base text-left text-slate-600 dark:text-slate-300">
                    <thead className="text-sm text-slate-700 uppercase bg-slate-100 dark:bg-slate-700/50 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="p-4">Vehículo</th>
                            <th scope="col" className="p-4">Autor y Calificación</th>
                            <th scope="col" className="p-4">Comentario</th>
                            <th scope="col" className="p-4 text-center">Estado</th>
                            <th scope="col" className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(review => {
                            const vehicle = vehicleMap.get(review.vehicle_id);
                            return (
                            <tr key={review.id} className="border-b dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                                <td className="p-4">{vehicle ? `${vehicle.make} ${vehicle.model}` : `ID: ${review.vehicle_id}`}</td>
                                <td className="p-4">
                                    <p className="font-semibold text-slate-800 dark:text-white">{review.author_name}</p>
                                    <StarRating rating={review.rating} size="sm" />
                                </td>
                                <td className="p-4 max-w-sm">
                                    <p className="truncate">{review.comment}</p>
                                    {review.admin_reply && <p className="mt-2 text-sm text-sky-700 dark:text-sky-400 border-l-2 border-sky-500 pl-2"><em>Respuesta: {review.admin_reply}</em></p>}
                                </td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleUpdate(review.id, { is_approved: !review.is_approved })} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${review.is_approved ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300' : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300'}`}>
                                        {review.is_approved ? 'Aprobada' : 'Pendiente'}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                     <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => setEditingReview(review)} className="p-2 text-slate-500 hover:text-blue-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" title="Editar y Responder"><EditIcon /></button>
                                        <button onClick={() => handleDelete(review.id)} className="p-2 text-slate-500 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" title="Eliminar"><TrashIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        )})}
                        {reviews.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-slate-500">No hay reseñas.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const EditReviewModal: React.FC<{review: Review, vehicle: Vehicle | undefined, onClose: () => void, onSave: (id: number, update: ReviewUpdate) => void}> = ({review, vehicle, onClose, onSave}) => {
    const [comment, setComment] = useState(review.comment);
    const [reply, setReply] = useState(review.admin_reply || '');

    const handleSave = () => {
        onSave(review.id, { comment, admin_reply: reply });
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-slate-700">
                    <h3 className="text-xl font-semibold">Editar Reseña</h3>
                    <p className="text-sm text-slate-500">Para {vehicle?.make} {vehicle?.model}</p>
                </div>
                <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-base font-medium">Comentario del Cliente</label>
                        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} className="mt-1 form-input" />
                    </div>
                     <div>
                        <label className="block text-base font-medium">Respuesta del Administrador (opcional)</label>
                        <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} placeholder="Escribe una respuesta aquí..." className="mt-1 form-input" />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-base font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 text-base font-medium text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker">Guardar</button>
                </div>
                 <style>{`.form-input{display:block;width:100%;padding:0.5rem 0.75rem;background-color:#fff;border:1px solid #d1d5db;border-radius:0.375rem;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)}.dark .form-input{background-color:#1f2937;border-color:#4b5563;color:#e5e7eb}.form-input:focus{outline:0;box-shadow:0 0 0 2px rgba(108,30,39,.5);border-color:#6c1e27}`}</style>
            </div>
        </div>,
        document.getElementById('modal-root') || document.body
    );
}

export const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'stats' | 'reviews' | 'settings'>('inventory');

    return (
        <div className="bg-slate-100 dark:bg-slate-900/50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 min-h-[85vh]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Panel de Administración</h1>
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
                <nav className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
                    <TabButton name="Inventario" icon={<FileCheckIcon className="h-5 w-5 sm:h-6 sm:w-6"/>} isActive={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
                    <TabButton name="Estadísticas" icon={<StatsIcon className="h-5 w-5 sm:h-6 sm:w-6"/>} isActive={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                    <TabButton name="Reseñas" icon={<ReviewIcon className="h-5 w-5 sm:h-6 sm:w-6"/>} isActive={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
                    <TabButton name="Configuración" icon={<SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6"/>} isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>
            </div>
            
            <div className="mt-8">
                {activeTab === 'inventory' && <InventoryView {...props} />}
                {activeTab === 'stats' && <StatsView vehicles={props.vehicles} allEvents={props.allEvents} onDataRefresh={props.onDataRefresh} onLogout={props.onLogout} authHeaders={props.authHeaders} />}
                {activeTab === 'reviews' && <ReviewsView vehicles={props.vehicles} onDataRefresh={props.onDataRefresh} onLogout={props.onLogout} authHeaders={props.authHeaders} />}
                {activeTab === 'settings' && <SettingsView financingSettings={props.financingSettings} onDataRefresh={props.onDataRefresh} onLogout={props.onLogout} authHeaders={props.authHeaders} />}
            </div>
        </div>
    );
};