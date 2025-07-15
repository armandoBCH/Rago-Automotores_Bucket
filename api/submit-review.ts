
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import { ReviewInsert } from '../types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const reviewData = request.body as ReviewInsert;
    
    if (!reviewData.vehicle_id || !reviewData.author_name || !reviewData.rating || !reviewData.comment) {
        return response.status(400).json({ message: 'Invalid review data.' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }
    
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
          ...reviewData,
          is_approved: false, // Reviews are not approved by default
      });

    if (error) throw error;

    return response.status(201).json({ success: true });

  } catch (error: any) {
    console.error('Error in submit-review handler:', error);
    return response.status(500).json({ message: 'Error submitting review.', details: error.message });
  }
}
