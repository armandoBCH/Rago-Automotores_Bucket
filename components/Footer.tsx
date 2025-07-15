

import React from 'react';
import { LocationPinIcon, InstagramIcon, ChatBubbleIcon, ClockIcon } from '../constants';
import { trackEvent } from '../lib/analytics';

const Footer: React.FC = () => {
    const address = "Av. Ituzaingó 2658, Olavarría, Buenos Aires";
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    const instagramUrl = "https://www.instagram.com/ragoautomotores?igsh=MWJuamF6ZXF5YjF4cw%3D%3D";
    const phoneNumber = "5492284635692";
    const phoneDisplay = "+54 9 2284 63-5692";
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    const telUrl = `tel:+${phoneNumber}`;

    return (
        <footer className="bg-slate-900 dark:bg-rago-black text-slate-400">
            <div className="container mx-auto px-6 lg:px-8">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-8 py-16 lg:py-20">
                    
                    {/* Brand Info */}
                    <div className="md:col-span-3 lg:col-span-1 flex flex-col items-center text-center md:items-start md:text-left">
                        <a href="/" aria-label="Rago Automotores Home">
                             <img src="https://i.imgur.com/zOGb0ay.jpeg" alt="Rago Automotores Logo" className="h-20 mb-5" />
                        </a>
                        <p className="text-base max-w-xs">
                            Tu concesionaria de confianza para vehículos seleccionados. Calidad y transparencia en cada venta.
                        </p>
                    </div>

                    {/* Navegación */}
                    <div className="text-center md:text-left">
                        <h3 className="text-base font-bold text-white uppercase tracking-wider mb-5">Navegación</h3>
                        <ul className="space-y-4">
                             <li>
                                <a href="/" className="text-slate-400 hover:text-white transition-colors duration-300">
                                   Inicio
                                </a>
                            </li>
                            <li>
                                <a href="/#catalog" className="text-slate-400 hover:text-white transition-colors duration-300">
                                   Catálogo
                                </a>
                            </li>
                             <li>
                                <a 
                                    href="/#sell-car-section"
                                    className="text-slate-400 hover:text-white transition-colors duration-300"
                                >
                                   Vender mi Auto
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Contacto */}
                    <div className="text-center md:text-left">
                        <h3 className="text-base font-bold text-white uppercase tracking-wider mb-5">Contacto</h3>
                        <ul className="space-y-4">
                             <li>
                                <a href={telUrl} onClick={() => trackEvent('click_phone_footer')} className="inline-flex items-center text-slate-400 hover:text-white transition-colors group">
                                    <ChatBubbleIcon className="h-6 w-6 mr-3 flex-shrink-0 text-rago-burgundy" />
                                    <span className="group-hover:underline">{phoneDisplay}</span>
                                </a>
                            </li>
                            <li>
                                <a href={instagramUrl} onClick={() => trackEvent('click_instagram')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-slate-400 hover:text-white transition-colors group">
                                    <InstagramIcon className="h-6 w-6 mr-3 flex-shrink-0 text-rago-burgundy" />
                                    <span className="group-hover:underline">@ragoautomotores</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                     {/* Ubicación */}
                    <div className="text-center md:text-left">
                        <h3 className="text-base font-bold text-white uppercase tracking-wider mb-5">Ubicación</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-start text-slate-400 hover:text-white transition-colors group">
                                    <LocationPinIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-rago-burgundy" />
                                    <span className="group-hover:underline">{address}</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Horarios de Atención */}
                    <div className="text-center md:text-left">
                        <h3 className="text-base font-bold text-white uppercase tracking-wider mb-5">Horarios</h3>
                        <div className="inline-flex items-start text-left">
                            <ClockIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-rago-burgundy" />
                            <div>
                               <p><strong className="text-slate-200">Lunes a Viernes:</strong><br/> 9:00 a 17:00</p>
                               <p className="mt-3"><strong className="text-slate-200">Sábados:</strong><br/> 9:00 a 13:30</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 py-8 flex flex-col-reverse sm:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-center sm:text-left">
                        &copy; {new Date().getFullYear()} Rago Automotores. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-x-6">
                        <a href={instagramUrl} onClick={() => trackEvent('click_instagram')} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-white transition-transform hover:scale-110 duration-300">
                            <InstagramIcon className="h-7 w-7" />
                        </a>
                         <a href={whatsappUrl} onClick={() => trackEvent('click_whatsapp_general')} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-slate-400 hover:text-white transition-transform hover:scale-110 duration-300">
                            <ChatBubbleIcon className="h-7 w-7" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;