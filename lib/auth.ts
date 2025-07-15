
import { createHmac } from 'crypto';
import type { VercelRequest } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET;

const base64UrlEncode = (str: string) => Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const base64UrlDecode = (str: string) => {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return Buffer.from(str, 'base64').toString();
};

export const generateToken = (payload: object): string => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not set!');
    }

    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac('sha256', JWT_SECRET).update(signatureInput).digest('base64url');
    
    return `${signatureInput}.${signature}`;
};

export const verifyToken = (token: string): object | null => {
    if (!JWT_SECRET) {
        console.error('JWT_SECRET environment variable is not set!');
        return null;
    }
    try {
        const [encodedHeader, encodedPayload, signature] = token.split('.');
        if (!encodedHeader || !encodedPayload || !signature) {
            return null;
        }

        const signatureInput = `${encodedHeader}.${encodedPayload}`;
        const expectedSignature = createHmac('sha256', JWT_SECRET).update(signatureInput).digest('base64url');
        
        if (signature !== expectedSignature) {
            return null;
        }
        
        return JSON.parse(base64UrlDecode(encodedPayload));
    } catch (e) {
        console.error("Token verification failed:", e);
        return null;
    }
};

export const getVerifiedTokenPayload = (req: VercelRequest): object | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
};
