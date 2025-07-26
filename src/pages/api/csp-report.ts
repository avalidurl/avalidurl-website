import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const report = await request.json();
    
    // Log CSP violations for monitoring
    console.warn('CSP Violation Report:', {
      timestamp: new Date().toISOString(),
      report: JSON.stringify(report, null, 2),
      userAgent: request.headers.get('User-Agent'),
      referer: request.headers.get('Referer')
    });
    
    // In production, you can send to monitoring services like Sentry
    if (import.meta.env.PROD) {
      // Example: Send to external monitoring service
      // await fetch('https://your-monitoring-service.com/csp-violations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ report, timestamp: new Date().toISOString() })
      // });
    }
    
    return new Response('CSP violation report received', { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'X-Content-Type-Options': 'nosniff'
      }
    });
    
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return new Response('Error processing report', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
};