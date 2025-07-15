
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import { FinancingSettingsUpdate } from '../types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { password, settings } = request.body as { password: string, settings: FinancingSettingsUpdate };

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      return response.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    if (!settings || typeof settings.max_amount !== 'number' || typeof settings.max_installments !== 'number' || typeof settings.interest_rate !== 'number') {
        return response.status(400).json({ message: 'Datos de configuración inválidos.' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabaseAdmin
        .from('financing_settings')
        .update({
            max_amount: settings.max_amount,
            max_installments: settings.max_installments,
            interest_rate: settings.interest_rate,
            updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select()
        .single();

    if (error) throw error;

    return response.status(200).json({ success: true, settings: data });

  } catch (error: any) {
    console.error('Error in save-financing-settings handler:', error);
    return response.status(500).json({ message: 'Error saving settings.', details: error.message });
  }
}
