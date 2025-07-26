import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const envVars = {
    TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY || 'NOT_SET',
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ? 'SET' : 'NOT_SET',
    PUBLIC_TURNSTILE_SITE_KEY: process.env.PUBLIC_TURNSTILE_SITE_KEY || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    ALL_ENV_KEYS: Object.keys(process.env).filter(key => key.includes('TURNSTILE'))
  };

  return new Response(JSON.stringify(envVars, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}; 