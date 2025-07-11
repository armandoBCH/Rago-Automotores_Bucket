

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { vehicleId } = request.body;
    if (!vehicleId) {
        return response.status(400).json({ message: 'vehicleId is required.' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return response.status(500).json({ message: 'Server configuration is incomplete.' });
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
    
    const { data: vehicle, error: fetchError } = await supabaseAdmin
        .from('vehicles')
        .select('images')
        .eq('id', vehicleId)
        .single();
    
    if (fetchError) {
        if (fetchError.code === 'PGRST116') return response.status(200).json({ success: true, message: 'Vehicle already deleted.' });
        console.error('Error fetching vehicle for deletion:', fetchError);
        return response.status(404).json({ message: `Vehicle with id ${vehicleId} not found.` });
    }

    if (vehicle && vehicle.images && vehicle.images.length > 0) {
        const filePaths = vehicle.images.map((url: string) => {
            try {
                const urlObject = new URL(url);
                const pathParts = urlObject.pathname.split('/vehicle-images/');
                return pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : null;
            } catch (e) { return null; }
        }).filter((path: string | null): path is string => path !== null);

        if (filePaths.length > 0) {
            const { error: storageError } = await supabaseAdmin.storage
                .from('vehicle-images')
                .remove(filePaths);
            
            if (storageError) {
                console.error(`Storage Error: Could not delete images for vehicle ${vehicleId}.`, storageError);
            }
        }
    }

    const { error: deleteError } = await supabaseAdmin
      .from('vehicles')
      .delete()
      .eq('id', vehicleId);

    if (deleteError) {
      console.error(`Database Error: Could not delete vehicle record for id ${vehicleId}`, deleteError);
      return response.status(500).json({ message: 'Error deleting vehicle from database.', details: deleteError.message });
    }

    return response.status(200).json({ success: true, message: 'Vehicle and associated images deleted successfully.' });

  } catch (error: any) {
    console.error('Error in delete-vehicle handler:', error);
    return response.status(500).json({ message: 'Internal Server Error.', details: error.message });
  }
}
