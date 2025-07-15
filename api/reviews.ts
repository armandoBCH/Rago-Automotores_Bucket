
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import type { ReviewInsert, ReviewUpdate } from '../types';

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    switch (req.method) {
        case 'GET':
            return handleGet(req, res);
        case 'POST':
            return handlePost(req, res);
        case 'PUT':
            return handleAdminActions(req, res, 'PUT');
        case 'DELETE':
            return handleAdminActions(req, res, 'DELETE');
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

// Handles fetching reviews (public vs admin)
async function handleGet(req: VercelRequest, res: VercelResponse) {
    const isAdmin = req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD;
    const supabaseUrl = process.env.SUPABASE_URL;
    // Use the correct server-side environment variables
    const supabaseKey = isAdmin ? process.env.SUPABASE_SERVICE_KEY : process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ message: 'Server configuration error.' });
    }
    
    try {
        const supabase = createClient<Database>(supabaseUrl, supabaseKey);
        let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });

        if (!isAdmin) {
            query = query.eq('is_approved', true);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return res.status(200).json(data || []);

    } catch (error: any) {
        return res.status(500).json({ message: 'Error fetching reviews.', details: error.message });
    }
}

// Handles submitting a new review
async function handlePost(req: VercelRequest, res: VercelResponse) {
    const { customer_name, rating, review_text, title } = req.body as ReviewInsert;
    if (!customer_name || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Customer name and a valid rating are required.' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    try {
        const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
        const { data, error } = await supabaseAdmin
            .from('reviews')
            .insert({ customer_name, rating, review_text, title, is_approved: false })
            .select().single();
        if (error) throw error;
        return res.status(201).json({ success: true, review: data });
    } catch (error: any) {
        return res.status(500).json({ message: 'Error submitting review.', details: error.message });
    }
}

// Handles PUT and DELETE which require admin auth
async function handleAdminActions(req: VercelRequest, res: VercelResponse, method: 'PUT' | 'DELETE') {
    if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Review ID is required.' });
    }

    try {
        const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
        if (method === 'PUT') {
            const { id: reviewId, ...updateData } = req.body as ReviewUpdate;
            const { data, error } = await supabaseAdmin.from('reviews').update(updateData).eq('id', id).select().single();
            if (error) throw error;
            return res.status(200).json({ success: true, review: data });
        } else { // DELETE
            const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);
            if (error) throw error;
            return res.status(200).json({ success: true, message: 'Review deleted.' });
        }
    } catch (error: any) {
        return res.status(500).json({ message: `Error performing ${method} on review.`, details: error.message });
    }
}
