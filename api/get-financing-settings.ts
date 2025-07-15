
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', ['GET']);
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }
    
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabaseAdmin
        .from('financing_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        if(error.code === 'PGRST116') { // Not found, maybe first time setup
            // Create default settings if they don't exist
            const { data: defaultData, error: insertError } = await supabaseAdmin
                .from('financing_settings')
                .insert({
                    id: 1,
                    max_amount: 5000000,
                    max_installments: 12,
                    interest_rate: 0.03,
                })
                .select()
                .single();
            if (insertError) throw insertError;
            return response.status(200).json({ settings: defaultData });
        }
        throw error;
    }

    return response.status(200).json({ settings: data });

  } catch (err: any) {
    console.error("Error in get-financing-settings handler:", err);
    response.status(500).json({ message: 'Error fetching financing settings', details: err.message });
  }
}
