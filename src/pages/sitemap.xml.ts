import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  // Get all blog posts
  const blogPosts = await getCollection('blog', ({ data }) => {
    return !data.draft && new Date(data.publishDate) <= new Date();
  });

  // Get all products
  const products = await getCollection('products', ({ data }) => {
    return !data.draft;
  }).catch(() => []);

  // Static pages
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'weekly' }, // Homepage
    { url: 'blog', priority: '0.9', changefreq: 'daily' },
    { url: 'topics', priority: '0.8', changefreq: 'weekly' },
    { url: 'categories', priority: '0.8', changefreq: 'weekly' },
    { url: 'archive', priority: '0.7', changefreq: 'weekly' },
    { url: 'links', priority: '0.6', changefreq: 'monthly' },
    { url: 'reading-list', priority: '0.6', changefreq: 'monthly' },
    { url: 'interviews', priority: '0.6', changefreq: 'monthly' },
    { url: 'products', priority: '0.7', changefreq: 'weekly' },
    { url: 'search', priority: '0.5', changefreq: 'monthly' },
    { url: 'subscribe', priority: '0.6', changefreq: 'monthly' },
    { url: 'privacy', priority: '0.3', changefreq: 'yearly' }
  ];

  // Get unique years and months for archive pages
  const archivePages = [];
  const years = [...new Set(blogPosts.map(post => 
    new Date(post.data.publishDate).getFullYear()
  ))];
  
  years.forEach(year => {
    archivePages.push({
      url: `archive/${year}`,
      priority: '0.6',
      changefreq: 'monthly'
    });
    
    // Get months for this year
    const monthsInYear = [...new Set(blogPosts
      .filter(post => new Date(post.data.publishDate).getFullYear() === year)
      .map(post => new Date(post.data.publishDate).toLocaleDateString('en-US', { month: 'long' }).toLowerCase())
    )];
    
    monthsInYear.forEach(month => {
      archivePages.push({
        url: `archive/${year}/${month}`,
        priority: '0.5',
        changefreq: 'monthly'
      });
    });
  });

  // Get unique categories
  const categories = [...new Set(blogPosts
    .map(post => post.data.category)
    .filter(Boolean)
    .map(cat => cat.toLowerCase().replace(/\s+/g, '-').replace('&', 'and'))
  )];

  const categoryPages = categories.map(category => ({
    url: `categories/${category}`,
    priority: '0.6',
    changefreq: 'weekly'
  }));

  // Get unique tags
  const allTags = [...new Set(blogPosts
    .flatMap(post => post.data.tags || [])
    .concat(products.flatMap(product => product.data.tags || []))
  )];

  const topicPages = allTags.map(tag => ({
    url: `topics/${tag.toLowerCase().replace(/\s+/g, '-')}`,
    priority: '0.5',
    changefreq: 'weekly'
  }));

  // Blog post pages
  const blogPostPages = blogPosts.map(post => ({
    url: `blog/${post.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: new Date(post.data.publishDate).toISOString().split('T')[0]
  }));

  // Product pages
  const productPages = products.map(product => ({
    url: `products/${product.slug}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod: product.data.publishDate ? new Date(product.data.publishDate).toISOString().split('T')[0] : undefined
  }));

  // Combine all pages
  const allPages = [
    ...staticPages,
    ...archivePages,
    ...categoryPages,
    ...topicPages,
    ...blogPostPages,
    ...productPages
  ];

  const baseUrl = 'https://gokhanturhan.com';

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.lastmod ? `
    <lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  });
};
