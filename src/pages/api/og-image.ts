import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { createGeneralRateLimiter, getClientIP, createRateLimitResponse } from '../../utils/rateLimit';

export const GET: APIRoute = async ({ request, url }) => {
  // Rate limiting
  const rateLimiter = createGeneralRateLimiter();
  const clientIP = getClientIP(request);
  const rateLimitResult = await rateLimiter.checkRateLimit(clientIP);
  
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }
  const searchParams = url.searchParams;
  const title = searchParams.get('title') || 'Gökhan Turhan';
  const description = searchParams.get('description') || 'T-shaped generalist solopreneur, researcher, and conceptual artist operating across fintech, deep tech, competitive governance, art markets, and investment strategies';
  const type = searchParams.get('type') || 'default';
  const slug = searchParams.get('slug'); // For blog posts
  
  // Generate Open Graph image as SVG (1200x630 for optimal social sharing)
  const width = 1200;
  const height = 630;

  // Extract quote from blog post if available
  const extractQuote = async (slug: string) => {
    try {
      const blogPosts = await getCollection('blog');
      const post = blogPosts.find(p => p.slug === slug);
      if (!post) return null;
      
      const content = post.body;
      
      // Look for quoted text (lines starting with >)
      const quoteMatch = content.match(/^>\s*(.+?)$/m);
      if (quoteMatch) {
        let quote = quoteMatch[1].trim();
        if (quote.length > 80) quote = quote.substring(0, 80) + '...';
        return quote;
      }
      
      // Look for sentences with interesting patterns
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        // Look for thought-provoking sentences
        if (trimmed.includes('manifesto') || trimmed.includes('conceptual') || 
            trimmed.includes('problem') || trimmed.includes('solution') ||
            trimmed.includes('future') || trimmed.includes('art') ||
            trimmed.includes('crypto') || trimmed.includes('blockchain')) {
          let quote = trimmed;
          if (quote.length > 80) quote = quote.substring(0, 80) + '...';
          return quote;
        }
      }
      
      // Fallback to first substantial sentence
      const firstSentence = sentences[0]?.trim();
      if (firstSentence && firstSentence.length > 20) {
        let quote = firstSentence;
        if (quote.length > 80) quote = quote.substring(0, 80) + '...';
        return quote;
      }
      
    } catch (error) {
      console.error('Error extracting quote:', error);
    }
    return null;
  };

  // Generate CTAs for different page types
  const generateCTA = (type: string, title: string) => {
    if (type === 'blog') return 'Read the full journal entry →';
    if (title.toLowerCase().includes('book')) return 'Discover what we read →';
    if (title.toLowerCase().includes('project')) return 'Explore the project →';
    if (title.toLowerCase().includes('subscribe')) return 'Join the newsletter →';
    if (title.toLowerCase().includes('about')) return 'Learn more about Gökhan →';
    return 'Visit gokhanturhan.com →';
  };

  const generateOGSVG = async (title: string, description: string, type: string, slug?: string) => {
    const baseStyles = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;`;
    
    // Extract quote for blog posts
    let quote = null;
    if (type === 'blog' && slug) {
      quote = await extractQuote(slug);
    }
    
    // Use quote as description if available, otherwise use provided description
    const displayText = quote || description;
    const truncatedTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;
    const truncatedDesc = displayText.length > 120 ? displayText.substring(0, 120) + '...' : displayText;
    const cta = generateCTA(type, title);

    // Split long text into multiple lines
    const wrapText = (text: string, maxLength: number) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        if ((currentLine + word).length <= maxLength) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      
      return lines.slice(0, 3); // Max 3 lines
    };

    const titleLines = wrapText(truncatedTitle, 35);
    const descLines = wrapText(truncatedDesc, 60);
    
    // Special case for niche digital corners post
    const isNicheDigitalCorners = slug === 'obscure-digital-corners';

    if (isNicheDigitalCorners) {
      // Special pelican monster truck design for this post
      return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <!-- Sky gradient background -->
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#B0E0E6;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#skyGrad)"/>
          
          <!-- Ground -->
          <rect y="500" width="100%" height="130" fill="#8B7355"/>
          
          <!-- Pelican Monster Truck (scaled and positioned for social card) -->
          <g transform="translate(700, 200) scale(0.8)">
            <!-- Monster truck body -->
            <rect x="0" y="80" width="240" height="80" fill="#FF0000" rx="8"/>
            <rect x="-15" y="95" width="270" height="48" fill="#CC0000" rx="4"/>
            
            <!-- Truck cab -->
            <rect x="144" y="35" width="96" height="64" fill="#FF0000" rx="8"/>
            <!-- Windshield -->
            <rect x="152" y="43" width="80" height="40" fill="#4A90E2" opacity="0.7"/>
            
            <!-- Monster truck details -->
            <rect x="8" y="88" width="24" height="16" fill="#FFD700"/>
            <rect x="40" y="88" width="24" height="16" fill="#FFD700"/>
            <rect x="72" y="88" width="24" height="16" fill="#FFD700"/>
            
            <!-- Suspension/lift -->
            <rect x="16" y="144" width="24" height="64" fill="#333333"/>
            <rect x="64" y="144" width="24" height="64" fill="#333333"/>
            <rect x="160" y="144" width="24" height="64" fill="#333333"/>
            <rect x="208" y="144" width="24" height="64" fill="#333333"/>
            
            <!-- Giant wheels -->
            <circle cx="40" cy="220" r="56" fill="#1C1C1C"/>
            <circle cx="40" cy="220" r="40" fill="#333333"/>
            <circle cx="40" cy="220" r="16" fill="#666666"/>
            
            <circle cx="184" cy="220" r="56" fill="#1C1C1C"/>
            <circle cx="184" cy="220" r="40" fill="#333333"/>
            <circle cx="184" cy="220" r="16" fill="#666666"/>
            
            <!-- Pelican body -->
            <ellipse cx="176" cy="0" rx="48" ry="64" fill="#FFFFFF"/>
            <ellipse cx="176" cy="16" rx="32" ry="40" fill="#F5F5F5"/>
            
            <!-- Pelican head -->
            <circle cx="176" cy="-48" r="28" fill="#FFFFFF"/>
            
            <!-- Pelican beak -->
            <path d="M148 -48 Q128 -44 124 -32 Q128 -20 148 -24 Z" fill="#FFA500"/>
            <path d="M148 -32 Q136 -28 132 -20 Q136 -12 148 -16 Z" fill="#FF8C00"/>
            
            <!-- Pelican eye -->
            <circle cx="160 -52" r="6" fill="#000000"/>
            <circle cx="162 -54" r="2" fill="#FFFFFF"/>
            
            <!-- Pelican wings on steering wheel -->
            <ellipse cx="152" cy="56" rx="20" ry="48" fill="#FFFFFF" transform="rotate(-25 152 56)"/>
            <ellipse cx="200" cy="56" rx="20" ry="48" fill="#FFFFFF" transform="rotate(25 200 56)"/>
            
            <!-- Steering wheel -->
            <circle cx="176" cy="66" r="20" fill="none" stroke="#333333" stroke-width="6"/>
            
            <!-- Racing number -->
            <circle cx="120" cy="104" r="24" fill="#FFFFFF"/>
            <text x="120" y="112" text-anchor="middle" font-family="Arial Black" font-size="28" fill="#000000">1</text>
            
            <!-- Flame decals -->
            <path d="M0 124 Q8 108 16 124 Q24 108 32 124 Q40 108 48 124 L48 140 L0 140 Z" fill="#FF6600" opacity="0.8"/>
          </g>
          
          <!-- Title with custom styling -->
          <rect x="50" y="50" width="600" height="400" fill="rgba(255,255,255,0.95)" rx="20"/>
          
          <!-- Header -->
          <text x="80" y="90" fill="#333333" style="${baseStyles} font-size: 20px; font-weight: 600;">
            GÖKHAN TURHAN
          </text>
          
          <!-- Main Title -->
          <text x="80" y="140" fill="#000000" style="${baseStyles} font-size: 32px; font-weight: 700;">
            Obscure Digital Corners:
          </text>
          <text x="80" y="180" fill="#000000" style="${baseStyles} font-size: 32px; font-weight: 700;">
            Underground Tech Communities
          </text>
          
          <!-- Description -->
          <text x="80" y="220" fill="#444444" style="${baseStyles} font-size: 18px;">
            A complete guide to alternative internet protocols,
          </text>
          <text x="80" y="245" fill="#444444" style="${baseStyles} font-size: 18px;">
            hidden programming communities, and technical archives
          </text>
          <text x="80" y="270" fill="#444444" style="${baseStyles} font-size: 18px;">
            that prioritize substance over scale.
          </text>
          
          <!-- Features -->
          <text x="80" y="320" fill="#666666" style="${baseStyles} font-size: 16px;">
            ✓ Gopher, Gemini & Alternative Protocols
          </text>
          <text x="80" y="345" fill="#666666" style="${baseStyles} font-size: 16px;">
            ✓ Amateur Radio & SDR Resources  
          </text>
          <text x="80" y="370" fill="#666666" style="${baseStyles} font-size: 16px;">
            ✓ Math Communities & Archives
          </text>
          <text x="80" y="395" fill="#666666" style="${baseStyles} font-size: 16px;">
            ✓ Secret Handshake Communities
          </text>
          
          <!-- CTA -->
          <text x="80" y="430" fill="#FF8C00" style="${baseStyles} font-size: 18px; font-weight: 600;">
            Discover the authentic internet →
          </text>
        </svg>
      `;
    }

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- White Background -->
        <rect width="100%" height="100%" fill="#FFFFFF"/>
        
        <!-- Subtle border -->
        <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#E5E5E5" stroke-width="2"/>
        
        <!-- Header with name -->
        <text x="60" y="80" fill="#333333" style="${baseStyles} font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
          GÖKHAN TURHAN
        </text>
        
        <!-- Divider line -->
        <line x1="60" y1="100" x2="1140" y2="100" stroke="#FF8C00" stroke-width="3"/>
        
        <!-- Main Title (multiple lines if needed) -->
        ${titleLines.map((line, i) => 
          `<text x="60" y="${160 + (i * 55)}" fill="#000000" style="${baseStyles} font-size: 42px; font-weight: 700; line-height: 1.2;">
            ${line}
          </text>`
        ).join('')}
        
        <!-- Description/Quote (multiple lines if needed) -->
        ${descLines.map((line, i) => 
          `<text x="60" y="${280 + titleLines.length * 55 + (i * 32)}" fill="#444444" style="${baseStyles} font-size: 22px; line-height: 1.4;">
            ${quote ? '"' + line + (i === descLines.length - 1 ? '"' : '') : line}
          </text>`
        ).join('')}
        
        <!-- Type Badge -->
        ${type === 'blog' ? `
        <rect x="60" y="480" width="100" height="36" fill="#FF8C00" rx="18"/>
        <text x="110" y="502" fill="#FFFFFF" text-anchor="middle" style="${baseStyles} font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
          JOURNAL
        </text>
        ` : ''}
        
        <!-- Call to Action -->
        <text x="60" y="560" fill="#666666" style="${baseStyles} font-size: 18px; font-weight: 500;">
          ${cta}
        </text>
        
        <!-- Bottom accent -->
        <rect x="0" y="${height - 6}" width="100%" height="6" fill="#FF8C00"/>
        
        <!-- Logo/Icon placeholder (small circle) -->
        <circle cx="1080" cy="550" r="25" fill="#FF8C00" opacity="0.1"/>
        <circle cx="1080" cy="550" r="15" fill="#FF8C00"/>
      </svg>
    `;
  };

  const svgContent = await generateOGSVG(
    decodeURIComponent(title), 
    decodeURIComponent(description), 
    type,
    slug || undefined
  );

  return new Response(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=7200', // Cache for 2 hours
    },
  });
};