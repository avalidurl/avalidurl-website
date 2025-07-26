import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const debug = {
    TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY ? 'SET' : 'NOT_SET',
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ? 'SET' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(debug, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}; 