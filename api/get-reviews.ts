
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { vehicle_id } = request.query;

  if (!vehicle_id || typeof vehicle_id !== 'string') {
    return response.status(400).json({ message: 'vehicle_id is required.' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }
    
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('vehicle_id', parseInt(vehicle_id, 10))
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return response.status(200).json({ reviews: data });

  } catch (err: any) {
    console.error("Error in get-reviews handler:", err);
    response.status(500).json({ message: 'Error fetching reviews', details: err.message });
  }
}
