
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({ message: 'La configuración de Supabase en el servidor está incompleta.' });
    }

    // Use the service_role key to bypass RLS for admin actions
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin
      .from('analytics_events')
      .select('*');

    if (error) {
      console.error('Error fetching analytics:', error);
      return response.status(500).json({ message: 'Error al obtener las estadísticas.', details: error.message });
    }

    return response.status(200).json(data || []);
  } catch (error: any) {
    console.error('Error en el manejador de get-analytics:', error);
    return response.status(500).json({ message: 'Error interno en el servidor.' });
  }
}
