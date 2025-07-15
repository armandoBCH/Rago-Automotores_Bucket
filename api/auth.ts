
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateToken } from '../lib/auth';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Set CORS headers for all responses
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Maneja las solicitudes pre-vuelo (preflight) para CORS
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // Asegura que solo se acepten métodos POST
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { password } = request.body;

    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminPassword || !jwtSecret) {
      console.error("Las variables de entorno ADMIN_PASSWORD y JWT_SECRET no están configuradas en el servidor.");
      return response.status(500).json({ message: 'La configuración del servidor está incompleta.' });
    }

    if (typeof password !== 'string') {
        return response.status(400).json({ message: 'El formato de la contraseña es inválido.' });
    }

    if (password.trim() === adminPassword.trim()) {
      const token = generateToken({ user: 'admin', iat: Date.now() });
      return response.status(200).json({ success: true, token });
    } else {
      return response.status(401).json({ message: 'Contraseña incorrecta.' });
    }
  } catch (error) {
    console.error("Error en el manejador de auth:", error);
    return response.status(500).json({ message: 'Error en el servidor.' });
  }
}
