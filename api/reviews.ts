
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import { ReviewUpdate, ReviewInsert } from '../types';
import { getVerifiedTokenPayload } from '../lib/auth';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const initSupabaseAdmin = () => {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase server configuration is incomplete.');
    }
    return createClient<Database>(supabaseUrl, supabaseServiceKey);
};

const initSupabasePublic = () => {
     const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase public configuration is incomplete.');
    }
    return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        switch (req.method) {
            case 'GET': {
                const { vehicle_id, admin } = req.query;
                if (admin === 'true') {
                    if (!getVerifiedTokenPayload(req)) {
                        return res.status(401).json({ message: 'Authentication required.' });
                    }
                    const supabaseAdmin = initSupabaseAdmin();
                    const { data, error } = await supabaseAdmin.from('reviews').select('*').order('created_at', { ascending: false });
                    if (error) throw error;
                    return res.status(200).json({ reviews: data });
                } else if (vehicle_id) {
                    const supabasePublic = initSupabasePublic();
                    const { data, error } = await supabasePublic.from('reviews').select('*').eq('vehicle_id', parseInt(vehicle_id as string, 10)).eq('is_approved', true).order('created_at', { ascending: false });
                    if (error) throw error;
                    return res.status(200).json({ reviews: data });
                } else {
                    return res.status(400).json({ message: 'Missing vehicle_id or admin parameter.' });
                }
            }

            case 'POST': { // Submit a new review (public)
                const { vehicle_id, author_name, rating, comment } = req.body as Partial<ReviewInsert>;
                
                if (!vehicle_id || !author_name || !rating || !comment) {
                    return res.status(400).json({ message: 'Invalid review data. Missing required fields.' });
                }

                const reviewToInsert: ReviewInsert = {
                    vehicle_id,
                    author_name,
                    rating,
                    comment,
                    is_approved: false,
                };

                const supabaseAdminInsert = initSupabaseAdmin();
                const { error: insertError } = await supabaseAdminInsert.from('reviews').insert(reviewToInsert);
                if (insertError) throw insertError;
                return res.status(201).json({ success: true });
            }

            case 'PATCH': { // Manage a review (update) (protected)
                if (!getVerifiedTokenPayload(req)) {
                    return res.status(401).json({ message: 'Authentication required.' });
                }
                const { reviewId, update } = req.body as { reviewId: number; update: ReviewUpdate };
                if (!reviewId || !update) {
                    return res.status(400).json({ message: 'Invalid request body for update.' });
                }
                const adminClientUpdate = initSupabaseAdmin();
                const { data: updatedData, error: updateError } = await adminClientUpdate.from('reviews').update(update).eq('id', reviewId).select().single();
                if (updateError) throw updateError;
                return res.status(200).json({ success: true, review: updatedData });
            }

            case 'DELETE': { // Delete a review (protected)
                 if (!getVerifiedTokenPayload(req)) {
                    return res.status(401).json({ message: 'Authentication required.' });
                }
                const { reviewId: idToDelete } = req.body as { reviewId: number };
                if (!idToDelete) {
                    return res.status(400).json({ message: 'reviewId is required for delete.' });
                }
                const adminClientDelete = initSupabaseAdmin();
                const { error: deleteError } = await adminClientDelete.from('reviews').delete().eq('id', idToDelete);
                if (deleteError) throw deleteError;
                return res.status(200).json({ success: true, message: 'Review deleted.' });
            }
                
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error: any) {
        console.error(`Error in /api/reviews (${req.method}):`, error);
        return res.status(500).json({ message: 'Internal Server Error', details: error.message });
    }
}