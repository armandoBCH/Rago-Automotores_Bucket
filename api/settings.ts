
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import { FinancingSettingsUpdate } from '../types';
import { getVerifiedTokenPayload } from '../lib/auth';

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const supabaseAdmin = initSupabaseAdmin();
        
        switch (req.method) {
            case 'GET': { // Public endpoint
                const { data, error } = await supabaseAdmin.from('financing_settings').select('*').eq('id', 1).single();
                if (error) {
                    if (error.code === 'PGRST116') { // Not found, create default
                         const { data: defaultData, error: insertError } = await supabaseAdmin.from('financing_settings').insert({ id: 1, max_amount: 5000000, max_installments: 12, interest_rate: 0.03 }).select().single();
                         if (insertError) throw insertError;
                         return res.status(200).json({ settings: defaultData });
                    }
                    throw error;
                }
                return res.status(200).json({ settings: data });
            }

            case 'POST': { // Protected endpoint
                if (!getVerifiedTokenPayload(req)) {
                    return res.status(401).json({ message: 'Authentication required.' });
                }

                const { settings } = req.body as { settings: FinancingSettingsUpdate };

                if (!settings || typeof settings.max_amount !== 'number' || typeof settings.max_installments !== 'number' || typeof settings.interest_rate !== 'number') {
                    return res.status(400).json({ message: 'Invalid settings data.' });
                }
                const { data: updatedData, error: updateError } = await supabaseAdmin.from('financing_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('id', 1).select().single();
                if (updateError) throw updateError;
                return res.status(200).json({ success: true, settings: updatedData });
            }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error: any) {
        console.error(`Error in /api/settings (${req.method}):`, error);
        return res.status(500).json({ message: 'Internal Server Error', details: error.message });
    }
}
