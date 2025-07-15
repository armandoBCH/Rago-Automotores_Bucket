
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import { getVerifiedTokenPayload } from '../lib/auth';
import { AnalyticsEventInsert } from '../types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const initSupabaseAdmin = () => {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase server configuration is incomplete.');
    }
    return createClient<Database>(supabaseUrl, supabaseServiceKey);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const supabaseAdmin = initSupabaseAdmin();

        switch (req.method) {
            case 'GET': { // Get all analytics (protected)
                if (!getVerifiedTokenPayload(req)) {
                    return res.status(401).json({ message: 'Authentication required.' });
                }
                const { data, error: getError } = await supabaseAdmin.from('analytics_events').select('*');
                if (getError) throw getError;
                return res.status(200).json(data || []);
            }

            case 'POST': { // Track an event (public)
                const { event_type, vehicle_id } = req.body as Partial<AnalyticsEventInsert>;
                
                if (typeof event_type !== 'string') {
                    return res.status(400).json({ message: 'Invalid event data provided.' });
                }

                const eventToInsert: AnalyticsEventInsert = {
                    event_type,
                    vehicle_id: vehicle_id ?? null
                };

                const { error: insertError } = await supabaseAdmin.from('analytics_events').insert(eventToInsert);
                if (insertError) throw insertError;
                return res.status(201).json({ success: true, message: 'Event recorded.' });
            }

            case 'DELETE': { // Reset analytics (protected)
                if (!getVerifiedTokenPayload(req)) {
                    return res.status(401).json({ message: 'Authentication required.' });
                }
                const { error: deleteError } = await supabaseAdmin.from('analytics_events').delete().gt('id', -1);
                if (deleteError) throw deleteError;
                return res.status(200).json({ success: true, message: 'Analytics reset successfully.' });
            }

            default:
                res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error: any) {
        console.error(`Error in /api/analytics (${req.method}):`, error);
        return res.status(500).json({ message: 'Internal Server Error', details: error.message });
    }
}
