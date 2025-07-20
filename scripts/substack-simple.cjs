#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Simple Substack Importer using direct RSS with pagination
 */

const SUBSTACK_URL = 'gokhan.substack.com';
const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const IMAGES_DIR = path.join(__dirname, '../public/blog/images');

// Ensure directories exist
if (!fs.existsSync(BLOG_DIR)) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

/**
 * Fetch content from URL
 */
async function fetchContent(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Get all posts using Substack API-like approach
 */
async function getAllPosts() {
  console.log('Trying different RSS feeds and offsets...');
  
  const allPosts = [];
  const seenUrls = new Set();
  
  // Try different RSS approaches
  const feedUrls = [
    `https://${SUBSTACK_URL}/feed`,
    `https://${SUBSTACK_URL}/feed.xml`,
    `https://${SUBSTACK_URL}/rss`,
  ];
  
  for (const feedUrl of feedUrls) {
    try {
      console.log(`Trying feed: ${feedUrl}`);
      const rssContent = await fetchContent(feedUrl);
      const posts = parseRSS(rssContent);
      
      posts.forEach(post => {
        if (!seenUrls.has(post.link)) {
          seenUrls.add(post.link);
          allPosts.push(post);
        }
      });
      
      console.log(`  Found ${posts.length} posts from this feed`);
      
    } catch (error) {
      console.log(`  Failed to fetch ${feedUrl}: ${error.message}`);
    }
  }
  
  return allPosts;
}

/**
 * Parse RSS feed (enhanced)
 */
function parseRSS(rssContent) {
  const items = [];
  
  // More robust item extraction
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(rssContent)) !== null) {
    const itemContent = match[1];
    
    // Extract title with multiple fallbacks
    let title = '';
    const titlePatterns = [
      /<title><!\[CDATA\[(.*?)\]\]><\/title>/,
      /<title>(.*?)<\/title>/,
      /<dc:title><!\[CDATA\[(.*?)\]\]><\/dc:title>/,
      /<dc:title>(.*?)<\/dc:title>/
    ];
    
    for (const pattern of titlePatterns) {
      const titleMatch = itemContent.match(pattern);
      if (titleMatch && titleMatch[1].trim()) {
        title = titleMatch[1].trim();
        break;
      }
    }
    
    // Extract description
    let description = '';
    const descPatterns = [
      /<description><!\[CDATA\[(.*?)\]\]><\/description>/,
      /<description>(.*?)<\/description>/,
      /<dc:description><!\[CDATA\[(.*?)\]\]><\/dc:description>/,
      /<dc:description>(.*?)<\/dc:description>/
    ];
    
    for (const pattern of descPatterns) {
      const descMatch = itemContent.match(pattern);
      if (descMatch && descMatch[1].trim()) {
        description = descMatch[1].trim();
        break;
      }
    }
    
    // Extract content
    let content = '';
    const contentPatterns = [
      /<content:encoded><!\[CDATA\[(.*?)\]\]><\/content:encoded>/s,
      /<content:encoded>(.*?)<\/content:encoded>/s,
      /<content><!\[CDATA\[(.*?)\]\]><\/content>/s,
      /<content>(.*?)<\/content>/s
    ];
    
    for (const pattern of contentPatterns) {
      const contentMatch = itemContent.match(pattern);
      if (contentMatch && contentMatch[1].trim()) {
        content = contentMatch[1].trim();
        break;
      }
    }
    
    // Use description as content if no content found
    if (!content && description) {
      content = description;
    }
    
    const pubDate = itemContent.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    const link = itemContent.match(/<link>(.*?)<\/link>/)?.[1] || '';
    
    // Extract categories/tags
    const categoryMatches = itemContent.match(/<category[^>]*>(.*?)<\/category>/g) || [];
    const categories = categoryMatches.map(cat => 
      cat.replace(/<category[^>]*>(.*?)<\/category>/, '$1').trim()
    );
    
    if (title && (content || description)) {
      items.push({
        title: title.trim(),
        description: description.trim(),
        content: content.trim() || description.trim(),
        pubDate,
        link,
        categories
      });
    }
  }
  
  return items;
}

/**
 * Generate slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

/**
 * Estimate reading time
 */
function estimateReadingTime(content) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

/**
 * Extract excerpt from content
 */
function extractExcerpt(content, maxLength = 200) {
  const textContent = content.replace(/<[^>]*>/g, '');
  const firstParagraph = textContent.split('\n\n')[0];
  
  if (firstParagraph.length <= maxLength) {
    return firstParagraph.trim();
  }
  
  return firstParagraph.substring(0, maxLength).trim() + '...';
}

/**
 * Convert HTML to Markdown (simplified)
 */
function htmlToMarkdown(html) {
  let markdown = html;
  
  // Convert headers
  markdown = markdown.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, content) => {
    const hashes = '#'.repeat(parseInt(level));
    return `\n${hashes} ${content.trim()}\n`;
  });
  
  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');
  
  // Convert links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Convert bold
  markdown = markdown.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, '**$2**');
  
  // Convert italic
  markdown = markdown.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, '*$2*');
  
  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (!items) return match;
    return '\n' + items.map(item => 
      '- ' + item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').trim()
    ).join('\n') + '\n';
  });
  
  // Convert line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  
  // Clean up HTML entities
  markdown = markdown.replace(/&nbsp;/g, ' ');
  markdown = markdown.replace(/&amp;/g, '&');
  markdown = markdown.replace(/&lt;/g, '<');
  markdown = markdown.replace(/&gt;/g, '>');
  markdown = markdown.replace(/&quot;/g, '"');
  markdown = markdown.replace(/&#39;/g, "'");
  markdown = markdown.replace(/&#8217;/g, "'");
  markdown = markdown.replace(/&#8220;/g, '"');
  markdown = markdown.replace(/&#8221;/g, '"');
  markdown = markdown.replace(/&#8212;/g, '—');
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');
  
  // Clean up extra whitespace
  markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
  markdown = markdown.replace(/^\s+|\s+$/g, '');
  
  return markdown;
}

/**
 * Format date for frontmatter
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Generate frontmatter
 */
function generateFrontmatter(post) {
  const excerpt = extractExcerpt(post.content || post.description);
  const readingTime = estimateReadingTime(post.content || post.description);
  const publishDate = formatDate(post.pubDate);
  
  // Generate tags from content analysis
  let tags = [...post.categories];
  
  const content = (post.content || post.description).toLowerCase();
  if (content.includes('finance') || content.includes('market') || content.includes('investment') || content.includes('defi') || content.includes('tradfi')) {
    tags.push('finance');
  }
  if (content.includes('art') || content.includes('design') || content.includes('creative') || content.includes('nft')) {
    tags.push('art');
  }
  if (content.includes('tech') || content.includes('technology') || content.includes('algorithm') || content.includes('ai')) {
    tags.push('technology');
  }
  if (content.includes('crypto') || content.includes('bitcoin') || content.includes('ethereum') || content.includes('blockchain')) {
    tags.push('crypto');
  }
  if (content.includes('data') || content.includes('visualization') || content.includes('dashboard')) {
    tags.push('data');
  }
  
  // Remove duplicates and limit
  tags = [...new Set(tags)].slice(0, 5);
  if (tags.length === 0) tags = ['general'];
  
  const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
description: "${post.description.replace(/"/g, '\\"')}"
publishDate: ${publishDate}
author: "Gokhan Turhan"
tags: [${tags.map(tag => `"${tag}"`).join(', ')}]
category: "${tags[0] || 'general'}"
featured: false
readingTime: ${readingTime}
excerpt: "${excerpt.replace(/"/g, '\\"')}"
originalUrl: "${post.link}"
---`;
  
  return frontmatter;
}

/**
 * Main import function
 */
async function importPosts() {
  try {
    console.log(`Starting simple import from ${SUBSTACK_URL}...`);
    
    const posts = await getAllPosts();
    console.log(`Found ${posts.length} total posts`);
    
    if (posts.length === 0) {
      console.log('No posts found. Check your Substack URL and RSS feed.');
      return;
    }
    
    let imported = 0;
    let skipped = 0;
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`\nProcessing post ${i + 1}/${posts.length}: ${post.title}`);
      
      // Generate filename
      const slug = generateSlug(post.title);
      if (!slug) {
        console.log(`  Skipping: Could not generate slug from title`);
        skipped++;
        continue;
      }
      
      const filename = `${slug}.md`;
      const filepath = path.join(BLOG_DIR, filename);
      
      // Skip if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`  Skipping: File already exists (${filename})`);
        skipped++;
        continue;
      }
      
      // Convert content to markdown
      const markdownContent = htmlToMarkdown(post.content || post.description);
      
      // Generate frontmatter
      const frontmatter = generateFrontmatter(post);
      
      // Combine frontmatter and content
      const finalContent = `${frontmatter}\n\n${markdownContent}`;
      
      // Write file
      fs.writeFileSync(filepath, finalContent, 'utf8');
      console.log(`  ✅ Created: ${filename}`);
      imported++;
    }
    
    console.log(`\n🎉 Import complete!`);
    console.log(`✅ Imported: ${imported} posts`);
    console.log(`⏭️  Skipped: ${skipped} posts`);
    console.log(`📁 Location: ${BLOG_DIR}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

// Run the import
importPosts();