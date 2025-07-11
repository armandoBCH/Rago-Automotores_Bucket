import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const baseUrl = `https://${request.headers.host}`;
  
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;

  response.setHeader('Content-Type', 'text/plain');
  response.status(200).send(robotsTxt);
}
