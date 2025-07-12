
import React from 'react';
import { optimizeUrl } from '../utils/image';

const generations = [
    {
        name: "El Fundador",
        title: "La Visión Original (1970s)",
        description: "Donde todo comenzó. Con una pasión por la mecánica y un compromiso inquebrantable con la honestidad, nuestro abuelo fundó Rago Automotores. Sentó las bases de un negocio basado en la confianza y la palabra.",
        image: "https://images.pexels.com/photos/831475/pexels-photo-831475.jpeg",
        values: ["Confianza", "Pionero", "Legado"]
    },
    {
        name: "La Consolidación",
        title: "Crecimiento y Experiencia (1990s)",
        description: "Heredando la pasión de su padre, la segunda generación expandió el negocio, modernizó las instalaciones y amplió nuestro catálogo. Se consolidó nuestra reputación de ofrecer solo vehículos de calidad seleccionada.",
        image: "https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg",
        values: ["Calidad", "Crecimiento", "Experiencia"]
    },
    {
        name: "El Futuro",
        title: "Innovación y Tradición (Hoy)",
        description: "Hoy, la tercera generación fusiona décadas de experiencia con una visión moderna. Incorporamos la tecnología para ofrecer una experiencia transparente y ágil, sin perder la cercanía y el trato personalizado que nos define.",
        image: "https://images.pexels.com/photos/7793661/pexels-photo-7793661.jpeg",
        values: ["Innovación", "Servicio", "Futuro"]
    }
];

const GenerationCard: React.FC<{ generation: typeof generations[0]; index: number; }> = ({ generation, index }) => (
    <div className="flex flex-col text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-rago-glow" style={{ animation: `fadeInUp 0.6s ${index * 0.15}s ease-out forwards`, opacity: 0 }}>
         <div className="mb-6 mx-auto">
            <img
                src={optimizeUrl(generation.image, { w: 128, h: 128, fit: 'cover', output: 'webp', q: 80, bri: -10 })}
                alt={generation.name}
                className="w-32 h-32 rounded-full object-cover object-center shadow-lg border-4 border-white/20"
                loading="lazy"
            />
        </div>
        <h3 className="text-xl font-bold text-rago-burgundy uppercase tracking-widest">{generation.name}</h3>
        <h4 className="text-2xl font-bold text-white mt-1">{generation.title}</h4>
        <p className="mt-4 text-slate-300 text-lg flex-grow">{generation.description}</p>
        <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-wrap justify-center gap-2">
                {generation.values.map(value => (
                    <span key={value} className="text-sm font-semibold py-1 px-3 bg-slate-700/50 text-slate-300 rounded-full">{value}</span>
                ))}
            </div>
        </div>
    </div>
);

const AboutUsSection: React.FC = () => {
    return (
        <section id="about-us-section" className="bg-slate-900 dark:bg-rago-black py-20 sm:py-28">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-sm">
                       Nuestra Historia
                    </h2>
                    <p className="mt-4 text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
                        Tres generaciones manteniendo la misma pasión y compromiso con nuestros clientes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {generations.map((gen, index) => (
                       <GenerationCard key={gen.title} generation={gen} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutUsSection;
