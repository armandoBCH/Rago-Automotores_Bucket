
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // This endpoint is public, it only exposes public keys.
  if (request.method !== 'GET') {
    response.setHeader('Allow', ['GET']);
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Public Supabase env vars are not set on the server.');
    return response.status(500).json({ message: 'Server configuration error.' });
  }

  // Set cache headers to allow clients to cache the response for a short time
  response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  return response.status(200).json({
    supabaseUrl,
    supabaseAnonKey,
  });
}
