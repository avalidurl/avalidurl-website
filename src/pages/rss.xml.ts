import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blog = await getCollection('blog', ({ data }) => {
    return !data.draft && new Date(data.publishDate) <= new Date();
  });

  const sortedPosts = blog.sort(
    (a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime()
  );

  return rss({
    title: 'GÖKHAN TURHAN - Journal',
    description: 'Tech executive and digital asset strategist exploring blockchain technology, DeFi protocols, stablecoins, tokenization, and art markets. Product leadership insights on fintech innovation, cryptography, and emerging financial infrastructure.',
    site: context.site,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.publishDate),
      description: post.data.description || post.data.excerpt,
      author: post.data.author,
      link: `/blog/${post.slug}/`,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}