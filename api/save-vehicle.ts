


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
    const { id, ...dataToSave } = request.body;

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }

    // Use the service_role key to bypass RLS for admin actions
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    let result;

    if (id) {
        // This is an update
        const { data, error } = await supabaseAdmin
            .from('vehicles')
            .update(dataToSave)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        result = data;
    } else {
        // This is a create, so we need to set the display_order
        const { data: maxOrderData, error: maxOrderError } = await supabaseAdmin
            .from('vehicles')
            .select('display_order')
            .order('display_order', { ascending: false, nullsFirst: false })
            .limit(1)
            .single();

        // PGRST116 means no rows found, which is okay for the first vehicle.
        if (maxOrderError && maxOrderError.code !== 'PGRST116') {
            throw maxOrderError;
        }

        const newOrder = (maxOrderData?.display_order ?? -1) + 1;
        dataToSave.display_order = newOrder;

        const { data, error } = await supabaseAdmin
            .from('vehicles')
            .insert(dataToSave)
            .select()
            .single();
        
        if (error) throw error;
        result = data;
    }

    return response.status(200).json({ success: true, vehicle: result });

  } catch (error: any) {
    console.error('Error in save-vehicle handler:', error);
    return response.status(500).json({ message: 'Error saving vehicle data.', details: error.message });
  }
}