import type { APIRoute } from 'astro';
import { env } from '../../utils/env';
import { createTurnstileRateLimiter, getClientIP, createRateLimitResponse } from '../../utils/rateLimit';

export const POST: APIRoute = async ({ request }) => {
  // Rate limiting
  const rateLimiter = createTurnstileRateLimiter();
  const clientIP = getClientIP(request);
  const rateLimitResult = await rateLimiter.checkRateLimit(clientIP);
  
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }
  try {
    const { token } = await request.json();
    
    // Use the env utility to access the secret key
    const secretKey = env.TURNSTILE_SECRET_KEY;
    
    if (!token) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No token provided' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!secretKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Turnstile not configured - secret key missing' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify the token with Cloudflare Turnstile
    const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const verificationResult = await verificationResponse.json();

    if (verificationResult.success) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Verification successful' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Verification failed',
        details: verificationResult['error-codes']
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 