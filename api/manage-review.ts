
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import { ReviewUpdate } from '../types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { reviewId, update } = request.body as { reviewId: number; update: ReviewUpdate & { toDelete?: boolean } };
    
    // In a real app, you would validate the admin's session here.

    if (!reviewId || !update) {
        return response.status(400).json({ message: 'Invalid request body.' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }
    
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    if (update.toDelete) {
        const { error } = await supabaseAdmin.from('reviews').delete().eq('id', reviewId);
        if (error) throw error;
        return response.status(200).json({ success: true, message: 'Review deleted.' });
    }

    const { toDelete, ...updateData } = update;
    const { data, error } = await supabaseAdmin
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId)
        .select()
        .single();
    
    if (error) throw error;
    
    return response.status(200).json({ success: true, review: data });

  } catch (error: any) {
    console.error('Error in manage-review handler:', error);
    return response.status(500).json({ message: 'Error managing review.', details: error.message });
  }
}
