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
    const { key } = request.query;
    if (!key || typeof key !== 'string') {
        return response.status(400).json({ message: 'A settings key is required.' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }
    
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return response.status(404).json({ message: `Settings for key '${key}' not found.`});
      }
      console.error('Error fetching settings:', error);
      throw error;
    }

    return response.status(200).json(data.value);

  } catch (error: any) {
    console.error('Error in get-settings handler:', error);
    return response.status(500).json({ message: 'Error fetching settings.', details: error.message });
  }
}
