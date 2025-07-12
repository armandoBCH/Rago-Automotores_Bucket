


import React, { useEffect, useRef } from 'react';
import { CheckIcon, ArrowRightIcon, SellCarIcon, FileCheckIcon, CogIcon, ShieldIcon } from '../constants';
import { optimizeUrl } from '../utils/image';
import { trackEvent } from '../lib/analytics';

const QualityCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; delay: number; }> = ({ icon, title, children, delay }) => (
    <div 
        className="bg-white/5 dark:bg-black/20 p-8 rounded-2xl text-center flex flex-col items-center animate-fade-in-up backdrop-blur-sm border border-white/10 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-rago-glow"
        style={{ animationDelay: `${delay}ms`}}
    >
        <div className="bg-rago-burgundy-darker/80 rounded-full p-4 mb-6 inline-block shadow-lg">
            {icon}
        </div>
        <h4 className="text-2xl font-bold text-white mb-3">{title}</h4>
        <p className="text-lg text-slate-200 leading-relaxed">{children}</p>
    </div>
);


const SellYourCarSection: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    trackEvent('view_sell_your_car');
                    // Disconnect observer after event is fired to prevent multiple trackings
                    if (sectionRef.current) {
                        observer.unobserve(sectionRef.current);
                    }
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.5, // Fire when 50% of the element is visible
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const contactMessage = "Hola, estoy interesado en vender mi vehículo con ustedes. Me gustaría recibir una cotización.";
    const whatsappLink = `https://wa.me/5492284635692?text=${encodeURIComponent(contactMessage)}`;
    const imageUrl = "https://res.cloudinary.com/dbq5jp6jn/image/upload/v1752115790/Gemini_Generated_Image_2lfdwh2lfdwh2lfd_zjz8tq.webp";

    return (
        <section ref={sectionRef} id="sell-car-section" className="relative text-white overflow-hidden bg-gradient-to-br from-rago-burgundy via-rago-burgundy-darker to-rago-black bg-[size:200%_200%] animate-bg-pan">
            <div className="absolute top-0 left-0 w-full h-24 overflow-hidden leading-[0]" style={{ transform: 'rotate(180deg) translateY(1px)' }}>
                <svg viewBox="0 0 960 100" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 45 L32 49.3 C64 53.7 128 62.3 192 61.2 C256 60 320 49 384 46.7 C448 44.3 512 50.7 576 57.7 C640 64.7 704 72.3 768 70.3 C832 68.3 896 56.7 928 50.8 L960 45 L960 101 L0 101Z" className="fill-slate-100 dark:fill-slate-950" />
                </svg>
            </div>
            <div className="container mx-auto px-6 lg:px-8 pt-20 md:pt-28 pb-16 md:pb-24">

                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg">
                        ¿Querés vender tu auto?
                    </h2>
                    <p className="mt-4 text-xl md:text-2xl text-slate-200 leading-relaxed max-w-4xl mx-auto">
                        Te lo compramos, lo aceptamos como parte de pago por una nueva unidad, o lo gestionamos por vos. Elegí la opción que más te convenga y obtené el mejor valor por tu vehículo.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-12 gap-y-12 items-center">
                    
                    <div className="animate-fade-in-up lg:col-span-3" style={{ animationDelay: '100ms' }}>
                        <div className="rounded-xl shadow-2xl overflow-hidden group">
                            <img 
                                src={optimizeUrl(imageUrl, { w: 800, h: 600, fit: 'cover', output: 'webp', q: 80 })}
                                alt="Hombre entregando llaves de auto en concesionaria" 
                                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                                loading="lazy"
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-col justify-center animate-fade-in-up lg:col-span-2" style={{ animationDelay: '250ms' }}>
                        <ul className="space-y-4">
                            <li className="flex items-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 ease-in-out hover:bg-white/10 hover:scale-[1.02]">
                                <CheckIcon className="h-8 w-8 text-green-400 flex-shrink-0 mr-4" />
                                <div>
                                    <h4 className="text-xl font-bold text-white">Tasación Justa y Profesional</h4>
                                    <p className="text-lg text-slate-200">Evaluamos tu auto al mejor precio del mercado.</p>
                                </div>
                            </li>
                            <li className="flex items-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 ease-in-out hover:bg-white/10 hover:scale-[1.02]">
                                <CheckIcon className="h-8 w-8 text-green-400 flex-shrink-0 mr-4" />
                                <div>
                                    <h4 className="text-xl font-bold text-white">Proceso Simple y Rápido</h4>
                                    <p className="text-lg text-slate-200">Nos encargamos de todo, desde la publicación hasta la transferencia.</p>
                                </div>
                            </li>
                            <li className="flex items-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 ease-in-out hover:bg-white/10 hover:scale-[1.02]">
                                <CheckIcon className="h-8 w-8 text-green-400 flex-shrink-0 mr-4" />
                                <div>
                                    <h4 className="text-xl font-bold text-white">Seguridad y Confianza</h4>
                                    <p className="text-lg text-slate-200">Operá con la tranquilidad de estar respaldado por profesionales.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* --- Opciones de Venta --- */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                    <div className="bg-black/10 backdrop-blur-sm border border-white/10 p-8 rounded-2xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <SellCarIcon className="h-14 w-14 text-green-400 mx-auto mb-4" />
                        <h4 className="text-2xl font-bold text-white mb-2">Opción 1: Compra Directa</h4>
                        <p className="text-lg text-slate-200">Te compramos el auto al instante, sin esperas.</p>
                    </div>
                     <div className="bg-black/10 backdrop-blur-sm border border-white/10 p-8 rounded-2xl animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        <FileCheckIcon className="h-14 w-14 text-green-400 mx-auto mb-4" />
                        <h4 className="text-2xl font-bold text-white mb-2">Opción 2: Venta por Consignación</h4>
                        <p className="text-lg text-slate-200">Lo vendemos por vos para maximizar tu ganancia.</p>
                    </div>
                </div>

                <div className="mt-16 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <a 
                        href={whatsappLink}
                        onClick={() => trackEvent('click_whatsapp_sell')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold text-rago-burgundy bg-white rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-pulse-light"
                    >
                        <span>¡Cotizá tu Vehículo GRATIS!</span>
                        <ArrowRightIcon className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                </div>
                
                <div className="mt-20 pt-16 border-t border-white/10">
                    <div className="text-center mb-12 animate-fade-in-up">
                        <h3 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg">
                            Nuestro Estándar de Calidad
                        </h3>
                        <p className="mt-4 text-xl text-slate-200 leading-relaxed max-w-3xl mx-auto">
                            Cada vehículo en consignación pasa por una rigurosa inspección de 3 puntos clave para garantizar tu tranquilidad y la nuestra.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <QualityCard 
                            icon={<CogIcon className="h-12 w-12 text-green-400" />}
                            title="Mecánica General"
                            delay={100}
                        >
                            Revisión completa del motor, transmisión y componentes vitales.
                        </QualityCard>
                        <QualityCard
                            icon={<ShieldIcon className="h-12 w-12 text-green-400" />}
                            title="Chasis y Seguridad"
                            delay={250}
                        >
                            Inspección de tren delantero, frenos y estado de neumáticos.
                        </QualityCard>
                        <QualityCard
                            icon={<FileCheckIcon className="h-12 w-12 text-green-400" />}
                            title="Documentación al Día"
                            delay={400}
                        >
                            Chequeo de deudas, multas y verificación policial.
                        </QualityCard>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default SellYourCarSection;