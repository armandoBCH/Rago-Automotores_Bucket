



import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*'); // In production, restrict this to your domain
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Security check: only admins should be able to get an upload URL
    if (request.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
        return response.status(401).json({ message: 'Unauthorized' });
    }

    const { fileName, fileType } = request.body;
    if (!fileName || !fileType) {
        return response.status(400).json({ message: 'fileName and fileType are required.' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({ message: 'Supabase server configuration is incomplete.' });
    }
    
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Sanitize file name to prevent path traversal or other attacks
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const path = `public/${Date.now()}-${sanitizedFileName}`;

    const { data, error } = await supabaseAdmin.storage
        .from('vehicle-images')
        .createSignedUploadUrl(path);

    if (error) {
        console.error('Supabase signed URL error:', error);
        throw new Error('Could not create signed URL.');
    }
    
    const url = new URL(data.signedUrl);
    const token = url.searchParams.get('token');

    if (!token) {
        console.error('Could not extract token from signed URL', data.signedUrl);
        throw new Error('Could not process signed URL token.');
    }

    return response.status(200).json({ token: token, path: data.path });

  } catch (error: any) {
    console.error('Error in create-signed-upload-url handler:', error);
    return response.status(500).json({ message: 'Error creating signed upload URL.', details: error.message });
  }
}