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
    const { vehicles } = request.body;

    if (!Array.isArray(vehicles)) {
        return response.status(400).json({ message: 'Request body must be an array of vehicles.' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }
    
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    const { error } = await supabaseAdmin
        .from('vehicles')
        .upsert(vehicles);

    if (error) {
        console.error('Error reordering vehicles:', error);
        return response.status(500).json({ message: 'Error updating vehicle order.', details: error.message });
    }

    return response.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Error in reorder-vehicles handler:', error);
    return response.status(500).json({ message: 'Internal Server Error.', details: error.message });
  }
}
