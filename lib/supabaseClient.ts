
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

let supabaseClient: SupabaseClient<Database> | null = null;

const fetchConfig = async (): Promise<{ supabaseUrl: string; supabaseAnonKey: string }> => {
    try {
        const response = await fetch('/api/config');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch Supabase config: ${response.status} ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching Supabase config:", error);
        
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
            <strong>Error de Configuración Crítico</strong>: <br/>
            No se pudo obtener la configuración del servidor. La aplicación no puede funcionar. <br/>
            Por favor, asegúrate de que las variables de entorno <strong>SUPABASE_URL</strong> y <strong>SUPABASE_ANON_KEY</strong> estén configuradas en Vercel.
        `;
        document.body.prepend(errorDiv);
        throw error;
    }
};

export const getSupabaseClient = async (): Promise<SupabaseClient<Database>> => {
    if (supabaseClient) {
        return supabaseClient;
    }

    const { supabaseUrl, supabaseAnonKey } = await fetchConfig();
    
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase URL and Anon Key are required but were not fetched from config.");
    }
    
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
};
