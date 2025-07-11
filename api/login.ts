// Vercel detectará este archivo como una función sin servidor.
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { password } = request.body;

    // Esta variable de entorno SÓLO existe en el servidor.
    // NO lleva el prefijo VITE_, por lo que nunca se expone al navegador.
    // NOTA: Al cambiar esta variable en Vercel, se debe realizar un nuevo despliegue.
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("La variable de entorno ADMIN_PASSWORD no está configurada en el servidor.");
      return response.status(500).json({ message: 'La configuración del servidor está incompleta.' });
    }

    if (typeof password !== 'string') {
        return response.status(400).json({ message: 'El formato de la contraseña es inválido.' });
    }

    // Usar trim() para eliminar espacios en blanco accidentales al principio o al final
    if (password.trim() === adminPassword.trim()) {
      return response.status(200).json({ success: true });
    } else {
      return response.status(401).json({ message: 'Contraseña incorrecta.' });
    }
  } catch (error) {
    console.error("Error en el manejador de login:", error);
    return response.status(500).json({ message: 'Error en el servidor.' });
  }
}
