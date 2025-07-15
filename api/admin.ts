


import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];
type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];
type FinancingConfig = Database['public']['Tables']['site_config']['Row']['value'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!supabaseUrl || !supabaseServiceKey || !adminPassword) {
            return res.status(500).json({ message: 'La configuración del servidor está incompleta.' });
        }
        
        const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

        if (req.method === 'GET') {
            const { data, error } = await supabaseAdmin.from('analytics_events').select('*');
            if (error) throw error;
            return res.status(200).json(data || []);
        }

        if (req.method === 'POST') {
            const { action, payload } = req.body;

            switch (action) {
                // ... existing vehicle cases
                case 'saveVehicle': {
                    const { id, ...dataToSave } = payload as VehicleInsert;
                    let result;
                    if (id) {
                        const { data, error } = await supabaseAdmin.from('vehicles').update(dataToSave).eq('id', id).select().single();
                        if (error) throw error;
                        result = data;
                    } else {
                        const { data: allOrders } = await supabaseAdmin.from('vehicles').select('display_order');
                        const maxOrder = (allOrders || []).reduce((max, v) => (v && typeof v.display_order === 'number' && v.display_order > max) ? v.display_order : max, -1);
                        dataToSave.display_order = maxOrder + 1;
                        if (!dataToSave.vehicle_type) dataToSave.vehicle_type = 'N/A';
                        const { data, error } = await supabaseAdmin.from('vehicles').insert(dataToSave).select().single();
                        if (error) throw error;
                        result = data;
                    }
                    return res.status(200).json({ success: true, vehicle: result });
                }

                case 'deleteVehicle': {
                    const { vehicleId } = payload;
                    if (!vehicleId) return res.status(400).json({ message: 'vehicleId es requerido.' });
                    
                    await supabaseAdmin.from('analytics_events').delete().eq('vehicle_id', vehicleId);
                    await supabaseAdmin.from('reviews').delete().eq('vehicle_id', vehicleId);

                    const { data: vehicle, error: fetchError } = await supabaseAdmin.from('vehicles').select('images').eq('id', vehicleId).single();
                    if (fetchError && fetchError.code !== 'PGRST116') {
                        return res.status(404).json({ message: `Vehículo con id ${vehicleId} no encontrado.` });
                    }

                    if (vehicle?.images?.length > 0) {
                        const filePaths = vehicle.images.map((url: string) => { try { const pathParts = new URL(url).pathname.split('/vehicle-images/'); return pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : null; } catch (e) { return null; } }).filter((p): p is string => p !== null);
                        if (filePaths.length > 0) await supabaseAdmin.storage.from('vehicle-images').remove(filePaths);
                    }

                    const { error: deleteError } = await supabaseAdmin.from('vehicles').delete().eq('id', vehicleId);
                    if (deleteError) throw deleteError;
                    
                    return res.status(200).json({ success: true, message: 'Vehículo y datos asociados eliminados.' });
                }
                
                // New Review Cases
                case 'get_all_reviews': {
                    const { data, error } = await supabaseAdmin.from('reviews').select('*').order('created_at', { ascending: false });
                    if (error) throw error;
                    return res.status(200).json(data || []);
                }
                case 'update_review': {
                    const { id, ...dataToUpdate } = payload as ReviewUpdate;
                    if (!id) return res.status(400).json({ message: 'ID de reseña requerido.'});
                    const { data, error } = await supabaseAdmin.from('reviews').update(dataToUpdate).eq('id', id).select().single();
                    if (error) throw error;
                    return res.status(200).json({ success: true, review: data });
                }
                case 'delete_review': {
                    const { id } = payload;
                    if (!id) return res.status(400).json({ message: 'ID de reseña requerido.' });
                    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);
                    if (error) throw error;
                    return res.status(200).json({ success: true, message: 'Reseña eliminada.'});
                }

                // New Config Case
                case 'update_financing_config': {
                    const configData = payload as FinancingConfig;
                    const { error } = await supabaseAdmin.from('site_config').upsert({ key: 'financing', value: configData });
                    if (error) throw error;
                    return res.status(200).json({ success: true, message: 'Configuración guardada.' });
                }

                case 'reorderVehicles': {
                    const { vehicles } = payload;
                    if (!Array.isArray(vehicles)) return res.status(400).json({ message: 'El payload debe ser un array de vehículos.' });
                    const { error } = await supabaseAdmin.rpc('reorder_vehicles', { updates: vehicles });
                    if (error) throw error;
                    return res.status(200).json({ success: true });
                }

                case 'resetAnalytics': {
                    const { password } = payload;
                    if (password?.trim() !== adminPassword.trim()) return res.status(401).json({ message: 'Contraseña incorrecta.' });
                    const { error } = await supabaseAdmin.from('analytics_events').delete().gt('id', -1);
                    if (error) throw error;
                    return res.status(200).json({ success: true, message: 'Estadísticas reiniciadas.' });
                }
                
                case 'createSignedUploadUrl': {
                    const { fileName, fileType } = payload;
                    if (!fileName || !fileType) return res.status(400).json({ message: 'fileName y fileType son requeridos.' });
                    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
                    const path = `public/${Date.now()}-${sanitizedFileName}`;
                    const { data, error } = await supabaseAdmin.storage.from('vehicle-images').createSignedUploadUrl(path);
                    if (error) throw error;
                    const token = new URL(data.signedUrl).searchParams.get('token');
                    if (!token) throw new Error('No se pudo procesar el token de la URL firmada.');
                    return res.status(200).json({ token, path: data.path });
                }

                default:
                    return res.status(400).json({ message: 'Acción inválida especificada.' });
            }
        }
        
        return res.status(405).json({ message: 'Método no permitido.' });
    } catch (error: any) {
        console.error(`Error en manejador de admin para acción "${req.body?.action}":`, error);
        return res.status(500).json({ message: 'Ocurrió un error en el servidor.', details: error.message });
    }
}
