import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import { slugify } from '../utils/image';

// This function generates a sitemap.xml for the website.
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return response.status(500).json({ message: 'Server configuration is incomplete.' });
        }
        
        const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
        
        const { data: vehicles, error } = await supabaseAdmin
            .from('vehicles')
            .select('id, make, model, created_at')
            .eq('is_sold', false);

        if (error) {
            console.error('Error fetching vehicles for sitemap:', error);
            throw error;
        }

        const baseUrl = `https://${request.headers.host}`;
        
        const staticPages = [
            { url: '/', priority: '1.0' },
            { url: '/#catalog', priority: '0.8' },
            { url: '/#featured-vehicles', priority: '0.7' },
            { url: '/#sell-car-section', priority: '0.7' },
        ];

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPages.map(page => `
    <url>
        <loc>${baseUrl}${page.url}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>${page.priority}</priority>
    </url>`).join('')}
    ${vehicles.map(vehicle => `
    <url>
        <loc>${baseUrl}/vehiculo/${slugify(`${vehicle.make} ${vehicle.model}`)}-${vehicle.id}</loc>
        <lastmod>${new Date(vehicle.created_at).toISOString()}</lastmod>
        <priority>0.9</priority>
    </url>`).join('')}
</urlset>`;

        response.setHeader('Content-Type', 'application/xml');
        response.status(200).send(sitemap);

    } catch (err) {
        console.error("Sitemap generation error:", err);
        response.status(500).json({ message: 'Error generating sitemap' });
    }
}
