import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const searchParams = url.searchParams;
  const title = searchParams.get('title') || 'Gökhan Turhan';
  const description = searchParams.get('description') || 'T-shaped Generalist Solopreneur';
  const type = searchParams.get('type') || 'default';

  // Generate Open Graph image as SVG (1200x630 for optimal social sharing)
  const width = 1200;
  const height = 630;

  const generateOGSVG = (title: string, description: string, type: string) => {
    const baseStyles = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;`;
    
    // Truncate title if too long
    const truncatedTitle = title.length > 60 ? title.substring(0, 60) + '...' : title;
    const truncatedDesc = description.length > 100 ? description.substring(0, 100) + '...' : description;

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#000000"/>
            <stop offset="100%" style="stop-color:#1a1a1a"/>
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bg)"/>
        
        <!-- Brand -->
        <text x="60" y="120" fill="#FF8C00" style="${baseStyles} font-size: 32px; font-weight: 700;">
          GÖKHAN TURHAN
        </text>
        
        <!-- Main Title -->
        <text x="60" y="220" fill="#FFFFFF" style="${baseStyles} font-size: ${title.length > 30 ? '36' : '48'}px; font-weight: 600;">
          ${truncatedTitle}
        </text>
        
        <!-- Description -->
        <text x="60" y="320" fill="#CCCCCC" style="${baseStyles} font-size: 24px;">
          ${truncatedDesc}
        </text>
        
        ${type === 'blog' ? `
        <!-- Blog Badge -->
        <rect x="60" y="400" width="120" height="40" fill="#FF8C00" rx="8"/>
        <text x="120" y="425" fill="#000000" text-anchor="middle" style="${baseStyles} font-size: 16px; font-weight: 600;">
          JOURNAL
        </text>
        ` : `
        <!-- Website -->
        <text x="60" y="450" fill="#FF8C00" style="${baseStyles} font-size: 20px;">
          gokhanturhan.com
        </text>
        `}
        
        <!-- Bottom accent -->
        <rect x="0" y="${height - 8}" width="100%" height="8" fill="#FF8C00"/>
      </svg>
    `;
  };

  const svgContent = generateOGSVG(decodeURIComponent(title), decodeURIComponent(description), type);

  return new Response(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=7200', // Cache for 2 hours
    },
  });
};