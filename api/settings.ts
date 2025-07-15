
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    switch (req.method) {
        case 'GET':
            return handleGet(req, res);
        case 'POST':
            return handlePost(req, res);
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

// Fetch a setting (public)
async function handleGet(req: VercelRequest, res: VercelResponse) {
    const { key } = req.query;
    if (!key || typeof key !== 'string') {
        return res.status(400).json({ message: 'A settings key is required.' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    // Use the correct server-side environment variable, not the VITE_ prefixed one.
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(500).json({ message: 'Server configuration is incomplete.' });
    }
    
    try {
        const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
        const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ message: `Settings for key '${key}' not found.`});
            throw error;
        }
        return res.status(200).json(data.value);
    } catch (error: any) {
        return res.status(500).json({ message: 'Error fetching settings.', details: error.message });
    }
}

// Update a setting (admin only)
async function handlePost(req: VercelRequest, res: VercelResponse) {
    if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { key, value } = req.body;
    if (!key || value === undefined) {
        return res.status(400).json({ message: 'Settings key and value are required.' });
    }
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ message: 'Server configuration is incomplete.' });
    }
    
    try {
        const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
        const { data, error } = await supabaseAdmin
            .from('settings')
            .update({ value: value })
            .eq('key', key)
            .select().single();
        if (error) throw error;
        return res.status(200).json({ success: true, settings: data });
    } catch (error: any) {
        return res.status(500).json({ message: 'Error updating settings.', details: error.message });
    }
}
