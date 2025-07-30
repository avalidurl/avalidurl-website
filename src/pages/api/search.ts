import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q');
  
  if (!query || query.trim().length < 2) {
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get all blog posts
    const blogPosts = await getCollection('blog');
    
    // Get products if available
    const products = await getCollection('products').catch(() => []);
    
    const searchTerm = query.toLowerCase();
    const results: Array<{
      title: string;
      description?: string;
      excerpt?: string;
      url: string;
      type: string;
      publishDate?: Date;
    }> = [];

    // Search through blog posts
    blogPosts.forEach(post => {
      const score = calculateRelevanceScore(post, searchTerm);
      if (score > 0) {
        results.push({
          title: post.data.title,
          description: post.data.description,
          excerpt: generateExcerpt(post, searchTerm),
          url: `/blog/${post.slug}`,
          type: 'blog',
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
          excerpt: generateExcerpt(product, searchTerm),
          url: `/products/${product.slug}`,
          type: 'product'
        });
      }
    });

    // Sort by relevance (you could implement a proper scoring system)
    results.sort((a, b) => {
      const aScore = (a.title.toLowerCase().includes(searchTerm) ? 10 : 0) +
                    (a.description?.toLowerCase().includes(searchTerm) ? 5 : 0);
      const bScore = (b.title.toLowerCase().includes(searchTerm) ? 10 : 0) +
                    (b.description?.toLowerCase().includes(searchTerm) ? 5 : 0);
      return bScore - aScore;
    });

    return new Response(JSON.stringify({ 
      results: results.slice(0, 20), // Limit to 20 results
      total: results.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
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
