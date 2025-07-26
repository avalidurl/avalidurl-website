import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ url }) => {
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