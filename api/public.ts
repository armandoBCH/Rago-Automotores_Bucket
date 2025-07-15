
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ message: 'Server configuration is incomplete.' });
    }
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    try {
        if (req.method === 'GET') {
            const [reviewsRes, financingConfigRes] = await Promise.all([
                supabaseAdmin.from('reviews').select('*').or('is_visible.eq.true,show_on_homepage.eq.true').order('created_at', { ascending: false }),
                supabaseAdmin.from('site_config').select('value').eq('key', 'financing').single()
            ]);

            if (reviewsRes.error) throw reviewsRes.error;
            if (financingConfigRes.error) {
                // If config doesn't exist, return a default.
                if (financingConfigRes.error.code === 'PGRST116') {
                     const defaultConfig = { maxAmount: 5000000, maxTerm: 12, interestRate: 3 };
                     return res.status(200).json({ 
                        reviews: reviewsRes.data || [], 
                        financingConfig: defaultConfig 
                    });
                }
                throw financingConfigRes.error;
            }

            return res.status(200).json({
                reviews: reviewsRes.data || [],
                financingConfig: financingConfigRes.data.value || {}
            });
        }

        if (req.method === 'POST') {
             const { customer_name, rating, comment, vehicle_id, honeypot } = req.body;

            // Simple honeypot spam protection
            if (honeypot) {
                return res.status(400).json({ message: 'Spam detected.' });
            }

            if (!customer_name || !rating) {
                return res.status(400).json({ message: 'Name and rating are required.' });
            }

            const { error } = await supabaseAdmin.from('reviews').insert({
                customer_name,
                rating: Number(rating),
                comment,
                vehicle_id: vehicle_id ? Number(vehicle_id) : null,
                is_visible: false, // All reviews start as hidden
                show_on_homepage: false, // All reviews start as hidden from homepage
            });

            if (error) throw error;
            
            return res.status(201).json({ success: true, message: 'Gracias por tu reseña. Será revisada por un administrador.' });
        }

        res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error: any) {
        console.error('Error in public API handler:', error);
        res.status(500).json({ message: 'Internal Server Error', details: error.message });
    }
}