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

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const isAdmin = request.headers['x-admin-password'] === adminPassword;

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey || !adminPassword) {
      return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }
    
    const supabase = createClient<Database>(isAdmin ? supabaseUrl : supabaseUrl, isAdmin ? supabaseServiceKey : supabaseAnonKey);

    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('is_approved', true);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }

    return response.status(200).json(data || []);

  } catch (error: any) {
    console.error('Error in get-reviews handler:', error);
    return response.status(500).json({ message: 'Error fetching reviews.', details: error.message });
  }
}
