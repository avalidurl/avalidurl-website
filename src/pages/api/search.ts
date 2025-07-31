import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { createSearchRateLimiter, getClientIP, createRateLimitResponse } from '../../utils/rateLimit';

export const GET: APIRoute = async ({ request, url }) => {
  // Rate limiting
  const rateLimiter = createSearchRateLimiter();
  const clientIP = getClientIP(request);
  const rateLimitResult = await rateLimiter.checkRateLimit(clientIP);
  
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  const query = url.searchParams.get('q');
  
  if (!query || query.trim().length < 2) {
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get all blog posts
    const blogPosts = await getCollection('blog', ({ data }) => {
      return !data.draft && new Date(data.publishDate) <= new Date();
    });
    
    // Get products if available
    const products = await getCollection('products', ({ data }) => {
      return !data.draft;
    }).catch(() => []);
    
    const searchTerm = query.toLowerCase();
    const results: Array<{
      title: string;
      description?: string;
      excerpt?: string;
      url: string;
      type: string;
      category?: string;
      publishDate?: Date;
    }> = [];

    // Static pages content for search
    const staticPages = [
      {
        title: 'Home',
        url: '/',
        description: 'Personal website and digital journal of Gökhan Turhan',
        content: 'Gökhan Turhan finance art technology crypto web3 blockchain data analysis sabermetrics digital journal personal website intersection markets creativity code investment stablecoins rwa tokenization cryptography agi solopreneur researcher conceptual artist fintech deep tech competitive governance t-shaped generalist',
        type: 'page'
      },
      {
        title: 'About',
        url: '/about',
        description: 'Learn more about Gökhan Turhan',
        content: 'about bio biography background experience expertise solopreneur researcher conceptual artist',
        type: 'page'
      },
      {
        title: 'Topics',
        url: '/topics',
        description: 'Browse articles by topic and find content that interests you most',
        content: 'topics browse articles categories tags finance art technology crypto culture',
        type: 'page'
      },
      {
        title: 'Categories',
        url: '/categories',
        description: 'Browse content organized by topic areas',
        content: 'categories browse content topic areas finance markets crypto web3 art culture technology data general',
        type: 'page'
      },
      {
        title: 'Archive',
        url: '/archive',
        description: 'Complete archive of all journal posts organized by year and month',
        content: 'archive journal posts chronological date year month history complete collection',
        type: 'page'
      },
      {
        title: 'Links',
        url: '/links',
        description: 'Social media profiles and external links',
        content: 'social media links profiles twitter x linkedin github soundcloud warpcast farcaster lens bluesky threads',
        type: 'page'
      },
      {
        title: 'Products',
        url: '/products',
        description: 'Digital products, tools, and projects',
        content: 'products tools projects digital apps software development',
        type: 'page'
      },
      {
        title: 'Interviews',
        url: '/interviews',
        description: 'Audio and video interviews',
        content: 'interviews podcast audio video conversations discussions',
        type: 'page'
      },
      {
        title: 'Reading List',
        url: '/reading-list',
        description: 'Curated reading recommendations',
        content: 'reading list books recommendations literature curated selection',
        type: 'page'
      }
    ];

    // Search through blog posts
    blogPosts.forEach(post => {
      const score = calculateRelevanceScore(post, searchTerm);
      if (score > 0) {
        results.push({
          title: post.data.title,
          description: post.data.description,
          excerpt: generateExcerptWithHighlighting(post.data.title, post.data.description || '', searchTerm),
          url: `/blog/${post.slug}`,
          type: 'blog',
          category: post.data.category,
          publishDate: post.data.publishDate
        });
      }
    });

    // Search through products
    products.forEach(product => {
      const score = calculateRelevanceScore(product, searchTerm);
      if (score > 0) {
        results.push({
          title: product.data.title,
          description: product.data.description,
          excerpt: generateExcerptWithHighlighting(product.data.title, product.data.description || '', searchTerm),
          url: `/products/${product.slug}`,
          type: 'product',
          category: product.data.category
        });
      }
    });

    // Search through static pages
    staticPages.forEach(page => {
      const score = calculateStaticPageScore(page, searchTerm);
      if (score > 0) {
        results.push({
          title: page.title,
          description: page.description,
          excerpt: generateExcerptWithHighlighting(page.title, page.description, searchTerm),
          url: page.url,
          type: 'page'
        });
      }
    });

    // Sort by relevance and type priority
    results.sort((a, b) => {
      // Calculate relevance scores
      const aScore = (a.title.toLowerCase().includes(searchTerm) ? 10 : 0) +
                    (a.description?.toLowerCase().includes(searchTerm) ? 5 : 0);
      const bScore = (b.title.toLowerCase().includes(searchTerm) ? 10 : 0) +
                    (b.description?.toLowerCase().includes(searchTerm) ? 5 : 0);
      
      // If relevance scores are different, sort by relevance
      if (aScore !== bScore) {
        return bScore - aScore;
      }
      
      // If same relevance, prioritize by type: blog > product > page
      const typeOrder = { blog: 1, product: 2, page: 3 };
      const aTypeScore = typeOrder[a.type as keyof typeof typeOrder] || 4;
      const bTypeScore = typeOrder[b.type as keyof typeof typeOrder] || 4;
      
      if (aTypeScore !== bTypeScore) {
        return aTypeScore - bTypeScore;
      }
      
      // If same type and relevance, sort by publish date (newest first)
      if (a.publishDate && b.publishDate) {
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      }
      
      return 0;
    });

    return new Response(JSON.stringify({ 
      results: results.slice(0, 20), // Limit to 20 results
      total: results.length 
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Search temporarily unavailable',
      results: [] 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

function calculateRelevanceScore(item: any, searchTerm: string): number {
  let score = 0;
  const title = item.data.title?.toLowerCase() || '';
  const description = item.data.description?.toLowerCase() || '';
  const tags = item.data.tags?.join(' ').toLowerCase() || '';
  const categories = item.data.categories?.join(' ').toLowerCase() || '';

  // Title matches are most important
  if (title.includes(searchTerm)) score += 10;
  
  // Description matches
  if (description.includes(searchTerm)) score += 5;
  
  // Tag matches
  if (tags.includes(searchTerm)) score += 3;
  
  // Category matches
  if (categories.includes(searchTerm)) score += 3;

  // Word boundary matches (exact word matches get bonus)
  const words = searchTerm.split(' ');
  words.forEach(word => {
    if (word.length > 2) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(title)) score += 2;
      if (regex.test(description)) score += 1;
    }
  });

  return score;
}

function generateExcerpt(item: any, searchTerm: string): string {
  const description = item.data.description || '';
  const title = item.data.title || '';
  
  if (description.toLowerCase().includes(searchTerm.toLowerCase())) {
    return description;
  }
  
  if (title.toLowerCase().includes(searchTerm.toLowerCase())) {
    return `${title.substring(0, 100)}...`;
  }
  
  return description.substring(0, 150) + (description.length > 150 ? '...' : '');
}

function generateExcerptWithHighlighting(title: string, description: string, searchTerm: string): string {
  const text = description || title;
  if (!text) return '';
  
  // Find the search term in the text (case insensitive)
  const lowerText = text.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const index = lowerText.indexOf(lowerSearchTerm);
  
  if (index === -1) {
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
  }
  
  // Extract context around the search term
  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + searchTerm.length + 50);
  let excerpt = text.substring(start, end);
  
  // Add ellipsis if we cut the text
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';
  
  // Highlight the search term
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return excerpt.replace(regex, '<mark>$1</mark>');
}

function calculateStaticPageScore(page: any, searchTerm: string): number {
  let score = 0;
  const title = page.title?.toLowerCase() || '';
  const description = page.description?.toLowerCase() || '';
  const content = page.content?.toLowerCase() || '';

  // Title matches are most important
  if (title.includes(searchTerm)) score += 10;
  
  // Description matches
  if (description.includes(searchTerm)) score += 5;
  
  // Content matches
  if (content.includes(searchTerm)) score += 3;

  // Word boundary matches (exact word matches get bonus)
  const words = searchTerm.split(' ');
  words.forEach(word => {
    if (word.length > 2) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(title)) score += 2;
      if (regex.test(description)) score += 1;
    }
  });

  return score;
}
