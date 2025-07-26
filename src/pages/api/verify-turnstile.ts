import type { APIRoute } from 'astro';
import { env } from '../../utils/env.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No token provided' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.TURNSTILE_SECRET_KEY) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Turnstile not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify the token with Cloudflare
    const formData = new FormData();
    formData.append('secret', env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);

    const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const verificationResult = await verificationResponse.json();

    if (verificationResult.success) {
      return new Response(JSON.stringify({ 
        success: true,
        challenge_ts: verificationResult.challenge_ts,
        hostname: verificationResult.hostname
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Verification failed',
        error_codes: verificationResult['error-codes']
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Turnstile verification error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 