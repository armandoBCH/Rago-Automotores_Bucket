

import React from 'react';
import { DownIcon, SearchIcon, ArrowUpDownIcon } from '../constants';

interface HeroProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

const Hero: React.FC<HeroProps> = ({ searchTerm, onSearchChange }) => {

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // La búsqueda es en vivo, pero al hacer clic, el usuario espera ver los resultados.
        const section = document.getElementById('catalog');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="relative text-white overflow-hidden">
            {/* Background Image and Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    alt="Vehículo de lujo en un entorno moderno" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-rago-black/80 via-rago-burgundy-darker/40 to-black/30 bg-[size:200%_200%] animate-bg-pan"></div>
            </div>

            {/* Content - Changed to flex column for easier alignment */}
            <div className="relative z-10 container mx-auto text-center flex flex-col items-center px-6 pt-20 pb-32 md:pt-28 md:pb-40">
                <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
                        Nuestro Catálogo de Vehículos
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
                        Encuentra el auto perfecto para ti. Calidad y confianza en cada kilómetro.
                    </p>
                </div>

                <div className="mt-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="inline-flex items-center gap-3 px-5 py-3 text-lg font-bold text-white bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-md">
                        <ArrowUpDownIcon className="h-6 w-6 text-sky-400" />
                        <span>¡Aceptamos tu usado en parte de pago!</span>
                    </div>
                </div>

                <div className="mt-8 max-w-2xl w-full mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <form onSubmit={handleFormSubmit} className="relative bg-white/10 backdrop-blur-md p-2 rounded-2xl flex gap-2 border border-white/20 shadow-lg">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none z-10">
                            <SearchIcon className="h-6 w-6 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="¿Qué vehículo buscas?"
                            aria-label="Buscar vehículo"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full flex-grow pl-14 pr-5 py-4 text-lg bg-white/95 dark:bg-slate-900/90 border-transparent text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-rago-burgundy-darker rounded-xl transition-all duration-300"
                        />
                        <button
                            type="submit"
                            className="px-8 py-4 text-lg font-bold text-white bg-rago-burgundy rounded-xl hover:bg-rago-burgundy-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50 focus:ring-rago-burgundy-darker transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Buscar
                        </button>
                    </form>
                </div>

                {/* Explore Button Container */}
                <div className="mt-12 flex flex-col items-center gap-8 w-full max-w-lg mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                     <a
                        href="#catalog"
                        className="group flex flex-col items-center gap-3 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-full p-2"
                        aria-label="Explorar vehículos"
                    >
                        <span className="font-semibold tracking-widest text-lg uppercase text-white drop-shadow-md transition-all">
                            Explorar
                        </span>
                        <div className="w-14 h-14 rounded-full border-2 border-white/40 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-soft-bounce group-hover:border-white/70 group-hover:bg-black/40 transition-all duration-300">
                            <DownIcon className="h-7 w-7" />
                        </div>
                    </a>
                    
                    <div className="relative w-full flex items-center">
                        <div className="flex-grow border-t border-white/20"></div>
                        <span className="flex-shrink mx-4 text-white/80 uppercase text-sm tracking-wider">O</span>
                        <div className="flex-grow border-t border-white/20"></div>
                    </div>

                    <a
                        href="#sell-car-section"
                        className="px-10 py-4 text-xl font-bold text-slate-800 bg-white rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                        aria-label="Vender mi auto"
                    >
                        Vender mi Auto
                    </a>
                </div>
            </div>

            {/* Shape Divider */}
            <div className="absolute bottom-0 left-0 w-full h-20 md:h-28 overflow-hidden leading-none z-[5]" style={{ transform: 'translateY(1px)' }}>
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path d="M600,120C300,120,0,0,0,0V120H1200V0C1200,0,900,120,600,120Z" className="fill-slate-900 dark:fill-rago-black"></path>
                </svg>
            </div>
        </div>
    );
};

export default Hero;