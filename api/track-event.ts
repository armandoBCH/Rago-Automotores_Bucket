
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
    const eventData = request.body;
    
    // Basic validation
    if (!eventData || typeof eventData.event_type !== 'string') {
        return response.status(400).json({ message: 'Invalid event data provided.' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }

    // Use the service_role key to bypass RLS for admin actions
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert([eventData]);

    if (error) {
      console.error('Error inserting analytics event:', error);
      return response.status(500).json({ message: 'Error recording event.', details: error.message });
    }

    return response.status(201).json({ success: true, message: 'Event recorded.' });

  } catch (error: any) {
    console.error('Error in track-event handler:', error);
    return response.status(500).json({ message: 'Internal Server Error.', details: error.message });
  }
}
