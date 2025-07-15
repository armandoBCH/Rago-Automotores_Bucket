

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust for production
    res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Security check: All methods on this endpoint are for admins only.
    if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ message: 'Server configuration is incomplete.' });
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    try {
        switch (req.method) {
            case 'POST': // Save or create a vehicle
                return await handleSave(req, res, supabaseAdmin);
            case 'DELETE': // Delete a vehicle
                return await handleDelete(req, res, supabaseAdmin);
            case 'PATCH': // Reorder vehicles
                return await handleReorder(req, res, supabaseAdmin);
            default:
                res.setHeader('Allow', ['POST', 'DELETE', 'PATCH']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error: any) {
        console.error(`Error in vehicles handler for method ${req.method}:`, error);
        return res.status(500).json({ message: 'Internal Server Error.', details: error.message });
    }
}

async function handleSave(req: VercelRequest, res: VercelResponse, supabaseAdmin: any) {
    const { id, ...dataToSave } = req.body as VehicleInsert;
    let result;
    if (id) {
        const { data, error } = await supabaseAdmin.from('vehicles').update(dataToSave).eq('id', id).select().single();
        if (error) throw error;
        result = data;
    } else {
        const { data: allOrders, error: ordersError } = await supabaseAdmin.from('vehicles').select('display_order');
        if (ordersError) throw ordersError;
        const maxOrder = (allOrders || []).reduce((max, v) => (v.display_order !== null && v.display_order > max ? v.display_order : max), -1);
        dataToSave.display_order = maxOrder + 1;
        if (!dataToSave.vehicle_type) dataToSave.vehicle_type = 'N/A';
        const { data, error } = await supabaseAdmin.from('vehicles').insert([dataToSave]).select().single();
        if (error) throw error;
        result = data;
    }
    return res.status(200).json({ success: true, vehicle: result });
}

async function handleDelete(req: VercelRequest, res: VercelResponse, supabaseAdmin: any) {
    const { vehicleId } = req.body;
    if (!vehicleId) return res.status(400).json({ message: 'vehicleId is required.' });
    const { data: vehicle, error: fetchError } = await supabaseAdmin.from('vehicles').select('images').eq('id', vehicleId).single();
    if (fetchError) {
        if (fetchError.code === 'PGRST116') return res.status(200).json({ success: true, message: 'Vehicle already deleted.' });
        throw fetchError;
    }
    if (vehicle?.images?.length > 0) {
        const filePaths = vehicle.images.map((url: string) => {
            try {
                const urlObject = new URL(url);
                const pathParts = urlObject.pathname.split('/vehicle-images/');
                return pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : null;
            } catch (e) { return null; }
        }).filter((path: string | null): path is string => path !== null);

        if (filePaths.length > 0) {
            const { error: storageError } = await supabaseAdmin.storage.from('vehicle-images').remove(filePaths);
            if (storageError) console.error(`Storage Error: Could not delete images for vehicle ${vehicleId}.`, storageError);
        }
    }
    const { error: deleteError } = await supabaseAdmin.from('vehicles').delete().eq('id', vehicleId);
    if (deleteError) throw deleteError;
    return res.status(200).json({ success: true, message: 'Vehicle and associated images deleted successfully.' });
}

async function handleReorder(req: VercelRequest, res: VercelResponse, supabaseAdmin: any) {
    const { vehicles } = req.body;
    if (!Array.isArray(vehicles)) return res.status(400).json({ message: 'Request body must be an array of vehicles.' });
    const { error } = await supabaseAdmin.rpc('reorder_vehicles', { updates: vehicles });
    if (error) throw error;
    return res.status(200).json({ success: true });
}