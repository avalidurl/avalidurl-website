import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, url }) => {
  try {
    // Parse the frame message from the request
    const body = await request.json();
    
    // Basic frame validation
    if (!body || typeof body !== 'object') {
      return new Response('Invalid frame message', { status: 400 });
    }

    // Extract frame data
    const buttonIndex = body.untrustedData?.buttonIndex || 1;
    const fid = body.untrustedData?.fid;
    const inputText = body.untrustedData?.inputText;
    const castId = body.untrustedData?.castId;
    const frameUrl = body.untrustedData?.url || '';

    // Log frame interaction (you can enhance this for analytics)
    console.log('Frame interaction:', {
      buttonIndex,
      fid,
      inputText,
      frameUrl,
      timestamp: new Date().toISOString()
    });

    // Check if this is from a blog post frame
    const isBlogPost = frameUrl.includes('/blog/');

    // Handle different button actions
    switch (buttonIndex) {
      case 1:
        if (isBlogPost) {
          // For blog posts, show a "Continue Reading" frame that links to the full post
          return new Response(
            `<!DOCTYPE html>
            <html>
              <head>
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:image" content="${url.origin}/frame-default.svg" />
                <meta property="fc:frame:button:1" content="Continue Reading" />
                <meta property="fc:frame:button:1:action" content="link" />
                <meta property="fc:frame:button:1:target" content="${frameUrl}" />
                <meta property="fc:frame:button:2" content="Subscribe" />
                <meta property="fc:frame:button:2:action" content="link" />
                <meta property="fc:frame:button:2:target" content="${url.origin}/subscribe" />
              </head>
              <body>
                <p>Continue reading the full blog post...</p>
              </body>
            </html>`,
            {
              status: 200,
              headers: {
                'Content-Type': 'text/html',
              },
            }
          );
        } else {
          // Primary action - redirect to site for non-blog pages
          return new Response(
            `<!DOCTYPE html>
            <html>
              <head>
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:image" content="${url.origin}/frame-default.svg" />
                <meta property="fc:frame:button:1" content="Visit Site" />
                <meta property="fc:frame:button:1:action" content="link" />
                <meta property="fc:frame:button:1:target" content="${url.origin}" />
                <meta property="fc:frame:button:2" content="Subscribe" />
                <meta property="fc:frame:button:2:action" content="link" />
                <meta property="fc:frame:button:2:target" content="${url.origin}/subscribe" />
              </head>
              <body>
                <p>Thanks for your interest! Visit the site to explore more.</p>
              </body>
            </html>`,
            {
              status: 200,
              headers: {
                'Content-Type': 'text/html',
              },
            }
          );
        }

      case 2:
        // Secondary action - subscribe
        return new Response(
          `<!DOCTYPE html>
          <html>
            <head>
              <meta property="fc:frame" content="vNext" />
              <meta property="fc:frame:image" content="${url.origin}/images/frame-subscribe.png" />
              <meta property="fc:frame:button:1" content="Subscribe Now" />
              <meta property="fc:frame:button:1:action" content="link" />
              <meta property="fc:frame:button:1:target" content="${url.origin}/subscribe" />
            </head>
            <body>
              <p>Ready to subscribe? Click the button above!</p>
            </body>
          </html>`,
          {
            status: 200,
            headers: {
              'Content-Type': 'text/html',
            },
          }
        );

      default:
        return new Response('Invalid button', { status: 400 });
    }
  } catch (error) {
    console.error('Frame API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

// Handle GET requests with a simple response
export const GET: APIRoute = async ({ url }) => {
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Farcaster Frame API</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${url.origin}/og-image.jpg" />
        <meta property="fc:frame:button:1" content="Visit Site" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="${url.origin}" />
      </head>
      <body>
        <h1>Farcaster Frame API</h1>
        <p>This endpoint handles Farcaster Frame interactions.</p>
        <p><a href="${url.origin}">Visit main site</a></p>
      </body>
    </html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
};