import type { APIRoute } from 'astro';
import { env } from '../../utils/env';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token } = await request.json();
    
    console.log('🔍 Turnstile verification request received');
    console.log('Token length:', token ? token.length : 0);
    
    // Use the env utility to access the secret key
    const secretKey = env.TURNSTILE_SECRET_KEY;
    
    console.log('Secret key available:', !!secretKey);
    console.log('Secret key length:', secretKey ? secretKey.length : 0);
    console.log('Secret key preview:', secretKey ? secretKey.substring(0, 10) + '...' : 'NONE');
    
    if (!token) {
      console.log('❌ No token provided');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No token provided' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!secretKey) {
      console.log('❌ Turnstile secret key not configured');
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
    console.log('Turnstile verification result:', verificationResult);

    if (verificationResult.success) {
      console.log('✅ Turnstile verification successful');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Verification successful' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      console.log('❌ Turnstile verification failed:', verificationResult['error-codes']);
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
    console.error('❌ Turnstile verification error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 