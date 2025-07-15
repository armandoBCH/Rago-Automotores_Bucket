
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import { getVerifiedTokenPayload } from '../lib/auth';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const initSupabaseAdmin = () => {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase server configuration is incomplete.');
    }
    return createClient<Database>(supabaseUrl, supabaseServiceKey);
};

async function handleSaveVehicle(req: VercelRequest, res: VercelResponse) {
    const { id, ...dataToSave } = req.body;
    const supabaseAdmin = initSupabaseAdmin();
    let result;

    if (id) { // Update
        const { data, error } = await supabaseAdmin.from('vehicles').update(dataToSave).eq('id', id).select().single();
        if (error) throw error;
        result = data;
    } else { // Create
        const { data: allOrders, error: ordersError } = await supabaseAdmin.from('vehicles').select('display_order');
        if (ordersError) throw ordersError;
        const maxOrder = (allOrders || []).reduce((max, v) => (v && typeof v.display_order === 'number' && v.display_order > max) ? v.display_order : max, -1);
        dataToSave.display_order = maxOrder + 1;
        if (!dataToSave.vehicle_type) dataToSave.vehicle_type = 'N/A';
        const { data, error } = await supabaseAdmin.from('vehicles').insert(dataToSave).select().single();
        if (error) throw error;
        result = data;
    }
    return res.status(200).json({ success: true, vehicle: result });
}

async function handleReorder(req: VercelRequest, res: VercelResponse) {
    const { vehicles } = req.body;
    if (!Array.isArray(vehicles)) {
        return res.status(400).json({ message: 'Request body must be an array of vehicles.' });
    }
    const supabaseAdmin = initSupabaseAdmin();
    const { error } = await supabaseAdmin.rpc('reorder_vehicles', { updates: vehicles });
    if (error) throw error;
    return res.status(200).json({ success: true });
}

async function handleGetUploadUrl(req: VercelRequest, res: VercelResponse) {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
        return res.status(400).json({ message: 'fileName and fileType are required.' });
    }
    const supabaseAdmin = initSupabaseAdmin();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const path = `public/${Date.now()}-${sanitizedFileName}`;
    const { data, error } = await supabaseAdmin.storage.from('vehicle-images').createSignedUploadUrl(path);
    if (error) throw error;
    const url = new URL(data.signedUrl);
    const token = url.searchParams.get('token');
    if (!token) throw new Error('Could not process signed URL token.');
    return res.status(200).json({ token, path });
}

async function handleDeleteVehicle(req: VercelRequest, res: VercelResponse) {
    const { vehicleId } = req.body;
    if (!vehicleId) {
        return res.status(400).json({ message: 'vehicleId is required.' });
    }
    const supabaseAdmin = initSupabaseAdmin();
    const { data: vehicle, error: fetchError } = await supabaseAdmin.from('vehicles').select('images').eq('id', vehicleId).single();
    if (fetchError) {
        if (fetchError.code === 'PGRST116') return res.status(200).json({ success: true, message: 'Vehicle already deleted.' });
        throw fetchError;
    }
    if (vehicle && vehicle.images && vehicle.images.length > 0) {
        const filePaths = vehicle.images.map(url => {
            try {
                return new URL(url).pathname.split('/vehicle-images/').pop();
            } catch (e) {
                return null;
            }
        }).filter((path): path is string => !!path);

        if (filePaths.length > 0) {
            await supabaseAdmin.storage.from('vehicle-images').remove(filePaths);
        }
    }
    const { error: deleteError } = await supabaseAdmin.from('vehicles').delete().eq('id', vehicleId);
    if (deleteError) throw deleteError;
    return res.status(200).json({ success: true, message: 'Vehicle and associated images deleted successfully.' });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Protect all vehicle modification endpoints
    if (!getVerifiedTokenPayload(req)) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        if (req.method === 'POST') {
            const { action } = req.body;
            switch (action) {
                case 'reorder':
                    return await handleReorder(req, res);
                case 'get-upload-url':
                    return await handleGetUploadUrl(req, res);
                default:
                    return await handleSaveVehicle(req, res);
            }
        } else if (req.method === 'DELETE') {
            return await handleDeleteVehicle(req, res);
        } else {
            res.setHeader('Allow', ['POST', 'DELETE']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error: any) {
        console.error(`Error in /api/vehicles (${req.method}):`, error);
        return res.status(500).json({ message: 'Internal Server Error', details: error.message });
    }
}
