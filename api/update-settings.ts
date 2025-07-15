import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const requestPassword = request.headers['x-admin-password'];

  if (!adminPassword || requestPassword !== adminPassword) {
    return response.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const { key, value } = request.body;
    if (!key || value === undefined) {
      return response.status(400).json({ message: 'Settings key and value are required.' });
    }
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }
    
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin
      .from('settings')
      .update({ value: value })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;

    return response.status(200).json({ success: true, settings: data });

  } catch (error: any) {
    console.error('Error in update-settings handler:', error);
    return response.status(500).json({ message: 'Error updating settings.', details: error.message });
  }
}
