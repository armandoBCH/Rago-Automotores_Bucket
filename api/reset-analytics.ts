


import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { password } = request.body;

    const adminPassword = process.env.ADMIN_PASSWORD;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!adminPassword) {
      return response.status(500).json({ message: 'La contraseña de administrador no está configurada en el servidor.' });
    }
    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({ message: 'La configuración de Supabase en el servidor está incompleta.' });
    }

    if (typeof password !== 'string') {
      return response.status(400).json({ message: 'El formato de la contraseña es inválido.' });
    }
    
    if (password.trim() !== adminPassword.trim()) {
      return response.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // Use the service_role key to bypass RLS for admin actions
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Perform the delete operation
    const { error } = await supabaseAdmin
      .from('analytics_events')
      .delete()
      .gt('id', -1); // Deletes all rows, assuming IDs are positive integers

    if (error) {
      console.error('Error resetting analytics:', error);
      return response.status(500).json({ message: 'Error al borrar las estadísticas.', details: error.message });
    }

    return response.status(200).json({ success: true, message: 'Las estadísticas se han reiniciado correctamente.' });
  } catch (error) {
    console.error('Error en el manejador de reset-analytics:', error);
    return response.status(500).json({ message: 'Error interno en el servidor.' });
  }
}