

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

type AnalyticsEventInsert = Database['public']['Tables']['analytics_events']['Insert'];

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust for production
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ message: 'Server configuration is incomplete.' });
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    try {
        switch (req.method) {
            case 'GET':
                return await handleGet(req, res, supabaseAdmin);
            case 'POST':
                return await handlePost(req, res, supabaseAdmin);
            case 'DELETE':
                return await handleDelete(req, res, supabaseAdmin);
            default:
                res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error: any) {
        console.error(`Error in analytics handler for method ${req.method}:`, error);
        return res.status(500).json({ message: 'Internal Server Error.', details: error.message });
    }
}

async function handleGet(req: VercelRequest, res: VercelResponse, supabaseAdmin: any) {
    // This is admin-only, so we should check for password
    if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { data, error } = await supabaseAdmin.from('analytics_events').select('*');
    if (error) throw error;
    return res.status(200).json(data || []);
}

async function handlePost(req: VercelRequest, res: VercelResponse, supabaseAdmin: any) {
    const eventData = req.body as AnalyticsEventInsert;
    if (!eventData || typeof eventData.event_type !== 'string') {
        return res.status(400).json({ message: 'Invalid event data provided.' });
    }
    const { error } = await supabaseAdmin.from('analytics_events').insert([eventData]);
    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Event recorded.' });
}

async function handleDelete(req: VercelRequest, res: VercelResponse, supabaseAdmin: any) {
    if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // The password check is done via header, so no need to check req.body.password
    const { error } = await supabaseAdmin.from('analytics_events').delete().gt('id', -1);
    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Las estadísticas se han reiniciado correctamente.' });
}