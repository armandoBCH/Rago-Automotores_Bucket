import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const requestPassword = request.headers['x-admin-password'];

  if (!adminPassword || requestPassword !== adminPassword) {
    return response.status(401).json({ message: 'Unauthorized' });
  }
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return response.status(500).json({ message: 'Server configuration is incomplete.' });
  }
  
  const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

  try {
    if (request.method === 'PUT') {
      const { id, ...updateData } = request.body;
      if (!id) return response.status(400).json({ message: 'Review ID is required for update.' });

      const { data, error } = await supabaseAdmin
        .from('reviews')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return response.status(200).json({ success: true, review: data });

    } else if (request.method === 'DELETE') {
      const { id } = request.body;
      if (!id) return response.status(400).json({ message: 'Review ID is required for deletion.' });

      const { error } = await supabaseAdmin
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return response.status(200).json({ success: true, message: 'Review deleted.' });
    
    } else {
      return response.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error: any) {
    console.error('Error in manage-review handler:', error);
    return response.status(500).json({ message: 'Error managing review.', details: error.message });
  }
}
