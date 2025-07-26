import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog');
  
  const sortedPosts = blog
    .filter(post => !post.data.draft)
    .sort((a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime());

  return rss({
    title: 'GÖKHAN TURHAN - Journal',
    description: 'Exploring the intersection of finance, art, and technology through a curatorial lens.',
    site: context.site,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      author: post.data.author,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: `<language>en-us</language>`,
  });
}