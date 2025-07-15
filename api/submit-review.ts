import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import type { ReviewInsert } from '../types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { customer_name, rating, review_text, title } = request.body as ReviewInsert;

    if (!customer_name || !rating) {
      return response.status(400).json({ message: 'Customer name and rating are required.' });
    }
    
    if (rating < 1 || rating > 5) {
      return response.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }
    
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        customer_name,
        rating,
        review_text,
        title,
        is_approved: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting review:', error);
      throw error;
    }

    return response.status(201).json({ success: true, review: data });

  } catch (error: any) {
    console.error('Error in submit-review handler:', error);
    return response.status(500).json({ message: 'Error submitting review.', details: error.message });
  }
}
