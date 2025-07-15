
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

    // In a real app, you would validate the admin's session here.
    // For simplicity, we are assuming this endpoint is protected.

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            return response.status(500).json({ message: 'Server configuration is incomplete.' });
        }
        
        const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
        
        const { data, error } = await supabaseAdmin
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return response.status(200).json({ reviews: data });

    } catch (err: any) {
        console.error("Error in get-all-reviews handler:", err);
        response.status(500).json({ message: 'Error fetching reviews', details: err.message });
    }
}
