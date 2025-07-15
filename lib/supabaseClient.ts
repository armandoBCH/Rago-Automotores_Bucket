

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// En un entorno de desarrollo como este (basado en Vite/Next.js del lado del cliente),
// las variables de entorno expuestas al navegador DEBEN tener un prefijo.
// Vercel inyectará automáticamente las variables de entorno aquí.
// Para desarrollo local, necesitarás un archivo .env.local
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
    // Esto se mostrará en el navegador si las variables de entorno no están configuradas.
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.padding = '20px';
    errorDiv.style.backgroundColor = 'red';
    errorDiv.style.color = 'white';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.zIndex = '10000';
    errorDiv.innerHTML = `
        <strong>Error de Configuración</strong>: <br/>
        Las variables de entorno <strong>VITE_SUPABASE_URL</strong> y <strong>VITE_SUPABASE_ANON_KEY</strong> son obligatorias. <br/>
        Por favor, asegúrate de que estén configuradas en tu proyecto de Vercel. El despliegue podría tardar unos momentos en reflejar los cambios.
    `;
    document.body.prepend(errorDiv);

    throw new Error("Supabase URL and Anon Key are required. In a Vite-like environment, they must be prefixed with VITE_. Ensure they are set in your Vercel project settings.");
}


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);