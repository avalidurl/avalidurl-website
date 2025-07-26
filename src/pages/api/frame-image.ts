import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const searchParams = url.searchParams;
  const type = searchParams.get('type') || 'default';
  const title = searchParams.get('title') || 'Gökhan Turhan';
  const description = searchParams.get('description') || 'Finance, Art & Technology';

  // For now, we'll return a simple SVG-based image
  // In a production setup, you might want to use a service like Vercel's @vercel/og
  // or generate images with a headless browser
  
  const width = 1200;
  const height = 630; // 1.91:1 aspect ratio

  // Generate SVG content based on type
  const generateSVG = (type: string, title: string, description: string) => {
    const baseStyles = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    `;

    switch (type) {
      case 'blog':
        return `
          <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#000000"/>
                <stop offset="100%" style="stop-color:#1a1a1a"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#bg)"/>
            
            <!-- Brand -->
            <text x="60" y="80" fill="#FF8C00" style="${baseStyles} font-size: 32px; font-weight: 700;">
              GÖKHAN TURHAN
            </text>
            
            <!-- Blog Title -->
            <text x="60" y="200" fill="#FFFFFF" style="${baseStyles} font-size: 48px; font-weight: 600; line-height: 1.2;">
              <tspan x="60" dy="0">${title.length > 50 ? title.substring(0, 50) + '...' : title}</tspan>
            </text>
            
            <!-- Category -->
            <rect x="60" y="400" width="200" height="40" fill="#FF8C00" rx="8"/>
            <text x="160" y="425" fill="#000000" text-anchor="middle" style="${baseStyles} font-size: 18px; font-weight: 600;">
              JOURNAL
            </text>
            
            <!-- Bottom accent -->
            <rect x="0" y="${height - 8}" width="100%" height="8" fill="#FF8C00"/>
          </svg>
        `;

      case 'home':
        return `
          <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#000000"/>
                <stop offset="100%" style="stop-color:#1a1a1a"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#bg)"/>
            
            <!-- Main Title -->
            <text x="60" y="150" fill="#FFFFFF" style="${baseStyles} font-size: 64px; font-weight: 700;">
              GÖKHAN TURHAN
            </text>
            
            <!-- Subtitle -->
            <text x="60" y="220" fill="#FF8C00" style="${baseStyles} font-size: 32px; font-weight: 400;">
              T-shaped Generalist Solopreneur
            </text>
            
            <!-- Description -->
            <text x="60" y="320" fill="#CCCCCC" style="${baseStyles} font-size: 24px;">
              Finance • Art • Technology
            </text>
            
            <!-- Website -->
            <text x="60" y="450" fill="#FF8C00" style="${baseStyles} font-size: 20px; text-decoration: underline;">
              gokhanturhan.com
            </text>
            
            <!-- Bottom accent -->
            <rect x="0" y="${height - 8}" width="100%" height="8" fill="#FF8C00"/>
          </svg>
        `;

      case 'subscribe':
        return `
          <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#000000"/>
                <stop offset="100%" style="stop-color:#1a1a1a"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#bg)"/>
            
            <!-- Brand -->
            <text x="60" y="100" fill="#FF8C00" style="${baseStyles} font-size: 32px; font-weight: 700;">
              GÖKHAN TURHAN
            </text>
            
            <!-- Main Title -->
            <text x="60" y="200" fill="#FFFFFF" style="${baseStyles} font-size: 48px; font-weight: 600;">
              Subscribe to Newsletter
            </text>
            
            <!-- Description -->
            <text x="60" y="280" fill="#CCCCCC" style="${baseStyles} font-size: 24px;">
              Weekly insights on finance, art, and technology
            </text>
            
            <!-- Features -->
            <text x="60" y="350" fill="#FF8C00" style="${baseStyles} font-size: 20px;">
              ✦ Market psychology insights
            </text>
            <text x="60" y="390" fill="#FF8C00" style="${baseStyles} font-size: 20px;">
              ✦ Creative coding projects
            </text>
            <text x="60" y="430" fill="#FF8C00" style="${baseStyles} font-size: 20px;">
              ✦ Financial tools and analysis
            </text>
            
            <!-- Bottom accent -->
            <rect x="0" y="${height - 8}" width="100%" height="8" fill="#FF8C00"/>
          </svg>
        `;

      default:
        return `
          <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#000000"/>
            <text x="60" y="300" fill="#FFFFFF" style="${baseStyles} font-size: 48px;">
              ${title}
            </text>
            <rect x="0" y="${height - 8}" width="100%" height="8" fill="#FF8C00"/>
          </svg>
        `;
    }
  };

  const svgContent = generateSVG(type, decodeURIComponent(title), decodeURIComponent(description));

  return new Response(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};