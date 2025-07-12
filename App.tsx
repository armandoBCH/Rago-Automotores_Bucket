

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Vehicle, VehicleFormData, AnalyticsEvent, VehicleUpdate } from './types';
import { ChatBubbleIcon, InstagramIcon, CatalogIcon, SellCarIcon, HomeIcon, DownIcon, StarIcon } from './constants';
import { supabase } from './lib/supabaseClient';
import { trackEvent } from './lib/analytics';
import { optimizeUrl } from './utils/image';
import Header from './components/Header';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import VehicleList from './components/VehicleList';
import VehicleDetailPage from './components/VehicleDetailPage';
import AdminPanel from './components/AdminPanel';
import VehicleFormModal from './components/VehicleFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import SellYourCarSection from './components/SellYourCarSection';
import ScrollToTopButton from './components/ScrollToTopButton';
import FeaturedVehiclesSection from './components/FeaturedVehiclesSection';
import FavoritesSection from './components/FavoritesSection';

type ModalState = 
    | { type: 'none' }
    | { type: 'form'; vehicle?: Vehicle }
    | { type: 'confirmDelete'; vehicleId: number };

const App: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('rago-admin') === 'true');
    const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ make: '', year: '', price: '' });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [visibleCount, setVisibleCount] = useState(8);
    
    const [path, setPath] = useState(() => {
        const currentAdminState = sessionStorage.getItem('rago-admin') === 'true';
        if (currentAdminState && window.location.pathname === '/') return '/admin';
        return window.location.pathname;
    });

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setDbError(null);
        try {
            // Fetch vehicles always, now sorted by the new custom order field
            const vehiclesResult = await supabase
                .from('vehicles')
                .select('*')
                .order('is_sold', { ascending: true })
                .order('created_at', { ascending: false });
            
            if (vehiclesResult.error) throw vehiclesResult.error;
            setVehicles(vehiclesResult.data || []);

            // Conditionally fetch analytics only for admins
            if (isAdmin) {
                const response = await fetch('/api/get-analytics');
                if (!response.ok) {
                    console.error('Could not fetch analytics:', await response.text());
                    setAnalyticsEvents([]);
                } else {
                    const analyticsData: AnalyticsEvent[] = await response.json();
                    setAnalyticsEvents(analyticsData);
                }
            } else {
                setAnalyticsEvents([]); // Not admin, ensure analytics are clear
            }

        } catch (err: any) {
            console.error("Error fetching data:", err);
            setDbError("No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);
    
    const navigate = useCallback((newPath: string, replace = false) => {
        const currentPath = path + window.location.search + window.location.hash;
        if (newPath === currentPath) return;

        if (replace) {
            window.history.replaceState({}, '', newPath);
        } else {
            window.history.pushState({}, '', newPath);
        }
        setPath(newPath.split('?')[0].split('#')[0]);
    }, [path]);

    useEffect(() => {
        const handlePopState = () => setPath(window.location.pathname);
        
        const handleInternalLinkClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const anchor = target.closest('a');
            if (!anchor || !anchor.href || anchor.target === '_blank' || event.metaKey || event.ctrlKey) return;

            const destinationUrl = new URL(anchor.href, window.location.origin);
            if (destinationUrl.origin !== window.location.origin) return;

            event.preventDefault();
            
            const currentUrl = new URL(window.location.href);
            const isSamePage = currentUrl.pathname === destinationUrl.pathname && currentUrl.search === destinationUrl.search;
            const newPath = destinationUrl.pathname + destinationUrl.hash + destinationUrl.search;

            if (isSamePage && destinationUrl.hash) {
                 const targetElement = document.querySelector(destinationUrl.hash);
                 if (targetElement) {
                     targetElement.scrollIntoView({ behavior: 'smooth' });
                     if (destinationUrl.hash !== currentUrl.hash) window.history.pushState({}, '', newPath);
                 }
            } else if (!isSamePage || destinationUrl.hash) {
                navigate(newPath);
            }
            
            setIsMobileMenuOpen(false);
        };

        window.addEventListener('popstate', handlePopState);
        document.addEventListener('click', handleInternalLinkClick);
        return () => {
            window.removeEventListener('popstate', handlePopState);
            document.removeEventListener('click', handleInternalLinkClick);
        };
    }, [navigate]);

    useEffect(() => {
        if (window.location.hash) {
            const id = window.location.hash.slice(1);
            const timer = setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            return () => clearTimeout(timer);
        } else {
            window.scrollTo(0, 0);
        }
    }, [path]);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const handleLoginSuccess = () => {
        sessionStorage.setItem('rago-admin', 'true');
        setIsAdmin(true);
        navigate('/admin');
    };

    const handleLogout = () => {
        sessionStorage.removeItem('rago-admin');
        setIsAdmin(false);
        navigate('/');
    };
    
    const pathname = path.split('?')[0].split('#')[0] || '/';
    const vehicleDetailMatch = pathname.match(/^\/vehiculo\/(.+)$/);
    const slug = vehicleDetailMatch ? vehicleDetailMatch[1].replace(/\/$/, '') : null;
    const vehicleIdStr = slug ? slug.split('-').pop() ?? null : null;
    const vehicleId = vehicleIdStr ? parseInt(vehicleIdStr, 10) : null;
    const isHomePage = pathname === '/' || pathname === '/index.html';
    
    const selectedVehicle = useMemo(() => {
        if (!vehicleId || isNaN(vehicleId)) return null;
        return vehicles.find(v => v.id === vehicleId);
    }, [vehicleId, vehicles]);
    
     // SEO and Metadata Management
    useEffect(() => {
        const head = document.head;
        const updateMeta = (selector: string, content: string) => head.querySelector(selector)?.setAttribute('content', content);
        const updateLink = (selector: string, href: string) => head.querySelector(selector)?.setAttribute('href', href);
        
        // Canonical URL update for all pages
        const canonicalUrl = window.location.origin + path;
        updateLink('link[rel="canonical"]', canonicalUrl);
        updateMeta('meta[property="og:url"]', canonicalUrl);
        
        // Remove existing structured data
        head.querySelectorAll('script[type="application/ld+json"]').forEach(tag => tag.remove());
        
        if (isHomePage) {
            document.title = 'Rago Automotores - Venta de Usados Seleccionados en Olavarría';
            updateMeta('meta[name="description"]', 'Encontrá tu próximo vehículo en Rago Automotores. Ofrecemos un catálogo de autos usados seleccionados en Olavarría. Calidad, confianza y la mejor financiación.');
            updateMeta('meta[property="og:title"]', 'Rago Automotores - Catálogo de Vehículos');
            updateMeta('meta[property="og:description"]', 'Tu concesionaria de confianza para vehículos seleccionados. Calidad y transparencia en cada venta.');
            updateMeta('meta[property="og:image"]', 'https://i.imgur.com/zOGb0ay.jpeg');

            // Add Organization JSON-LD for homepage
            const orgSchema = {
                '@context': 'https://schema.org',
                '@type': 'AutoDealer',
                'name': 'Rago Automotores',
                'url': window.location.origin,
                'logo': 'https://i.imgur.com/zOGb0ay.jpeg',
                'address': {
                    '@type': 'PostalAddress',
                    'streetAddress': 'Av. Ituzaingó 2658',
                    'addressLocality': 'Olavarría',
                    'addressRegion': 'Buenos Aires',
                    'postalCode': 'B7400',
                    'addressCountry': 'AR'
                },
                'telephone': '+5492284635692',
                'openingHours': 'Mo-Fr 09:00-17:00, Sa 09:00-13:30',
                 'image': 'https://i.imgur.com/zOGb0ay.jpeg'
            };
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.innerHTML = JSON.stringify(orgSchema);
            head.appendChild(script);

        } else if (selectedVehicle) {
            const title = `${selectedVehicle.make} ${selectedVehicle.model} ${selectedVehicle.year} | Rago Automotores`;
            const description = `Encontrá este ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year}) en Rago Automotores. Kilometraje: ${selectedVehicle.mileage.toLocaleString('es-AR')} km. Precio: $${selectedVehicle.price.toLocaleString('es-AR')}.`;
            const imageUrl = optimizeUrl(selectedVehicle.images[0], { w: 1200, h: 630, fit: 'cover', q: 80, output: 'jpeg' });
            
            document.title = title;
            updateMeta('meta[name="description"]', description);
            updateMeta('meta[property="og:title"]', title);
            updateMeta('meta[property="og:description"]', description);
            updateMeta('meta[property="og:image"]', imageUrl);
            updateMeta('meta[name="twitter:title"]', title);
            updateMeta('meta[name="twitter:description"]', description);
            updateMeta('meta[name="twitter:image"]', imageUrl);
        }
        
    }, [path, selectedVehicle, isHomePage]);

    const uniqueBrands = useMemo(() => Array.from(new Set(vehicles.map(v => v.make))).sort(), [vehicles]);

    const filteredVehicles = useMemo(() => {
        let temp = [...vehicles];
        const term = searchTerm.toLowerCase().trim();
        if (term) temp = temp.filter(v => `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(term));
        if (filters.make) temp = temp.filter(v => v.make === filters.make);
        if (filters.year) temp = temp.filter(v => v.year >= parseInt(filters.year, 10));
        if (filters.price) temp = temp.filter(v => v.price <= parseInt(filters.price, 10));
        return temp;
    }, [vehicles, searchTerm, filters]);

    useEffect(() => {
        setVisibleCount(8);
    }, [searchTerm, filters]);

    const vehiclesToShow = useMemo(() => filteredVehicles.slice(0, visibleCount), [filteredVehicles, visibleCount]);
    const hasMoreVehicles = useMemo(() => filteredVehicles.length > visibleCount, [filteredVehicles, visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount(filteredVehicles.length);
    };

    const handleFilterChange = useCallback((newFilters: { make: string, year: string, price: string }) => setFilters(newFilters), []);
    const handleAddVehicleClick = () => setModalState({ type: 'form' });
    const handleEditVehicleClick = (vehicle: Vehicle) => setModalState({ type: 'form', vehicle });
    const handleDeleteVehicleClick = (vehicleId: number) => setModalState({ type: 'confirmDelete', vehicleId });
    const handleCloseModal = () => setModalState({ type: 'none' });

    const handleSaveVehicle = async (vehicleData: VehicleFormData) => {
        try {
            const response = await fetch('/api/save-vehicle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehicleData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al guardar el vehículo.');
            
            await fetchAllData();
            handleCloseModal();
        } catch (err: any) {
            alert(`Error al guardar el vehículo: ${err.message}`);
        }
    };
    
    const handleToggleFeatured = async (vehicleId: number, currentStatus: boolean) => {
       try {
            const response = await fetch('/api/save-vehicle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: vehicleId, is_featured: !currentStatus }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al actualizar el vehículo.');
            await fetchAllData();
       } catch (err: any) {
           alert(`Error al actualizar el vehículo: ${err.message}`);
       }
   };
   
    const handleToggleSold = async (vehicleId: number, currentStatus: boolean) => {
       try {
            const updatePayload: VehicleUpdate = { is_sold: !currentStatus };
            if (!currentStatus === true) { // This means we are marking it as sold
                updatePayload.is_featured = false;
            }

            const response = await fetch('/api/save-vehicle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: vehicleId, ...updatePayload }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al actualizar el estado del vehículo.');

            await fetchAllData();
       } catch (err: any) {
           alert(`Error al actualizar el estado del vehículo: ${err.message}`);
       }
   };

    const confirmDelete = async () => {
        if (modalState.type !== 'confirmDelete') return;
        setIsDeleting(true);
        try {
            const response = await fetch('/api/delete-vehicle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vehicleId: modalState.vehicleId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al eliminar.');
            await fetchAllData(); 
            handleCloseModal();
        } catch (err: any) {
            alert(`Error al eliminar el vehículo: ${err.message}`);
        } finally {
            setIsDeleting(false);
        }
    };
    
    const handleReorderVehicles = async (reorderedVehicles: Vehicle[]) => {
        // Optimistic update
        setVehicles(reorderedVehicles);

        const orderPayload = reorderedVehicles.map((vehicle, index) => ({
            id: vehicle.id,
            display_order: index,
        }));

        try {
            const response = await fetch('/api/reorder-vehicles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vehicles: orderPayload }),
            });
            if (!response.ok) {
                // Revert on error
                console.error("Failed to save new order, reverting.");
                await fetchAllData(); 
                alert("No se pudo guardar el nuevo orden.");
            }
        } catch (error) {
            console.error("Error saving new order:", error);
            await fetchAllData();
            alert("Ocurrió un error al guardar el nuevo orden.");
        }
    };
    
    const handleAnalyticsReset = () => fetchAllData();
    const NotFoundPage = () => (
        <div className="text-center py-16"><h1 className="text-4xl font-bold text-rago-burgundy mb-4">404</h1><p>Página No Encontrada</p><a href="/" className="mt-8 inline-block px-6 py-3 font-semibold text-white bg-rago-burgundy rounded-lg">Volver al Inicio</a></div>
    );
    
    const isAdminPage = path.startsWith('/admin');
    const isLoginPage = pathname === '/login';

    // --- ROUTING ---
    if (isLoginPage || (!isAdmin && isAdminPage)) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    if (isAdmin && isAdminPage) {
        return (
            <div className="bg-slate-100 dark:bg-slate-950 min-h-screen">
                <main className="container mx-auto px-4 md:px-6 py-8">
                    <AdminPanel 
                        vehicles={vehicles} 
                        allEvents={analyticsEvents} 
                        onAdd={handleAddVehicleClick} 
                        onEdit={handleEditVehicleClick} 
                        onDelete={handleDeleteVehicleClick} 
                        onLogout={handleLogout} 
                        onAnalyticsReset={handleAnalyticsReset} 
                        onToggleFeatured={handleToggleFeatured}
                        onToggleSold={handleToggleSold}
                        onReorder={handleReorderVehicles}
                    />
                </main>
                {modalState.type === 'form' && <VehicleFormModal isOpen={true} onClose={handleCloseModal} onSubmit={handleSaveVehicle} initialData={modalState.vehicle} brands={uniqueBrands} />}
                {modalState.type === 'confirmDelete' && <ConfirmationModal isOpen={true} onClose={handleCloseModal} onConfirm={confirmDelete} title="Confirmar Eliminación" message="¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer." isConfirming={isDeleting} />}
            </div>
        );
    }
    
    const renderPublicContent = () => {
        if (loading) return <div className="text-center py-16">Cargando...</div>;
        if (dbError) return <div className="text-center py-16 text-red-500">{dbError}</div>;
        if (vehicleId) return selectedVehicle ? <VehicleDetailPage vehicle={selectedVehicle} allVehicles={vehicles} /> : <NotFoundPage />;
        if (isHomePage) return (
            <>
                <FilterBar filters={filters} onFilterChange={handleFilterChange} brands={uniqueBrands} />
                <VehicleList vehicles={vehiclesToShow} />
                {hasMoreVehicles && (
                     <div className="text-center mt-12 animate-fade-in">
                        <button
                            onClick={handleLoadMore}
                            className="group inline-flex items-center justify-center gap-3 px-8 py-4 text-xl font-bold text-white bg-rago-burgundy rounded-lg hover:bg-rago-burgundy-darker focus:outline-none focus:ring-4 focus:ring-rago-burgundy/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <span>Mostrar {filteredVehicles.length - visibleCount} más</span>
                            <DownIcon className="h-6 w-6 transition-transform duration-300 group-hover:translate-y-1" />
                        </button>
                    </div>
                )}
            </>
        );
        return <NotFoundPage />;
    };
    
    const contactMessage = "Hola, estoy interesado en sus vehículos.";
    const whatsappLink = `https://wa.me/5492284635692?text=${encodeURIComponent(contactMessage)}`;
    const instagramUrl = "https://www.instagram.com/ragoautomotores?igsh=MWJuamF6ZXF5YjF4cw%3D%3D";

    const mainAppContainerClasses = `min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 font-sans transform-gpu origin-center relative transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'scale-[0.85] -translate-x-[70%] sm:-translate-x-64 rounded-3xl shadow-2xl overflow-y-hidden brightness-[0.7] blur-sm' : 'scale-100 translate-x-0 rounded-none shadow-none brightness-100 blur-0'}`;
    const hamburgerClasses = `md:hidden fixed top-6 right-6 z-[60] p-2 transition-colors duration-300 ${isMobileMenuOpen ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`;

    return (
        <div className="bg-slate-800 dark:bg-rago-black min-h-screen overflow-x-hidden">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={hamburgerClasses} aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"} aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}>
                <div id="nav-icon3" className={isMobileMenuOpen ? 'open' : ''}><span></span><span></span><span></span><span></span></div>
            </button>
            <nav id="mobile-menu" aria-hidden={!isMobileMenuOpen} className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-gradient-to-br from-slate-900 via-rago-burgundy-darker to-rago-black shadow-2xl p-6 pt-20 flex flex-col text-white transform-gpu transition-transform duration-500 ease-in-out z-50 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="px-6 mb-12 text-center"><a href="/"><img src="https://i.imgur.com/zOGb0ay.jpeg" alt="Rago Automotores Logo" className="h-20 inline-block" /></a></div>
                <ul className="flex flex-col gap-2">
                    <li><a href="/" className="flex items-center gap-4 px-3 py-4 text-2xl font-semibold text-slate-200 rounded-lg hover:bg-white/10 transition-colors"><HomeIcon className="h-7 w-7 text-rago-burgundy" /><span>Inicio</span></a></li>
                    <li><a href="/#catalog" className="flex items-center gap-4 px-3 py-4 text-2xl font-semibold text-slate-200 rounded-lg hover:bg-white/10 transition-colors"><CatalogIcon className="h-7 w-7 text-rago-burgundy" /><span>Catálogo</span></a></li>
                    <li><a href="/#featured-vehicles" className="flex items-center gap-4 px-3 py-4 text-2xl font-semibold text-slate-200 rounded-lg hover:bg-white/10 transition-colors"><StarIcon className="h-7 w-7 text-rago-burgundy" /><span>Destacados</span></a></li>
                    <li><a href="/#sell-car-section" className="flex items-center gap-4 px-3 py-4 text-2xl font-semibold text-slate-200 rounded-lg hover:bg-white/10 transition-colors"><SellCarIcon className="h-7 w-7 text-rago-burgundy" /><span>Vender mi Auto</span></a></li>
                </ul>
                <div className="mt-auto pt-8 border-t border-slate-700/50">
                    <div className="flex justify-center gap-x-8">
                        <a href={instagramUrl} onClick={() => trackEvent('click_instagram')} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-white transition-transform duration-300 hover:scale-110"><InstagramIcon className="h-8 w-8" /></a>
                        <a href={whatsappLink} onClick={() => trackEvent('click_whatsapp_general')} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-slate-400 hover:text-white transition-transform duration-300 hover:scale-110"><ChatBubbleIcon className="h-8 w-8" /></a>
                    </div>
                </div>
            </nav>
            <div className={mainAppContainerClasses}>
                {isMobileMenuOpen && <div role="button" aria-label="Cerrar menú" className="absolute inset-0 z-50" onClick={() => setIsMobileMenuOpen(false)}></div>}
                <Header />
                {isHomePage && <Hero searchTerm={searchTerm} onSearchChange={setSearchTerm} />}
                {isHomePage && <FavoritesSection allVehicles={vehicles} />}
                {isHomePage && <FeaturedVehiclesSection vehicles={vehicles} />}
                <main id="catalog" className="container mx-auto px-4 md:px-6 py-8 flex-grow">
                     <div key={path} className="animate-fade-in">{renderPublicContent()}</div>
                </main>
                {isHomePage && <SellYourCarSection />}
                <Footer />
            </div>
            {isHomePage && <ScrollToTopButton />}
        </div>
    );
};

export default App;