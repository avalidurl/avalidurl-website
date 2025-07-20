#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');

// Create scripts directory if it doesn't exist
const scriptsDir = path.dirname(__filename);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

/**
 * Substack RSS to Blog Importer
 * Converts Substack posts to Astro blog format
 */

const SUBSTACK_URL = 'gokhan.substack.com';
const RSS_URL = `https://${SUBSTACK_URL}/feed`;
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
 * Download image and save locally
 */
async function downloadImage(imageUrl, filename) {
  try {
    const imageData = await fetchContent(imageUrl);
    const imagePath = path.join(IMAGES_DIR, filename);
    fs.writeFileSync(imagePath, imageData, 'binary');
    return `/blog/images/${filename}`;
  } catch (error) {
    console.log(`Failed to download image: ${imageUrl}`);
    return imageUrl; // Return original URL if download fails
  }
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
  // Remove HTML tags and get first paragraph
  const textContent = content.replace(/<[^>]*>/g, '');
  const firstParagraph = textContent.split('\n\n')[0];
  
  if (firstParagraph.length <= maxLength) {
    return firstParagraph.trim();
  }
  
  return firstParagraph.substring(0, maxLength).trim() + '...';
}

/**
 * Convert HTML to Markdown
 */
function htmlToMarkdown(html) {
  let markdown = html;
  
  // Convert headers
  markdown = markdown.replace(/<h([1-6])>(.*?)<\/h[1-6]>/gi, (match, level, content) => {
    const hashes = '#'.repeat(parseInt(level));
    return `\n${hashes} ${content.trim()}\n`;
  });
  
  // Convert paragraphs
  markdown = markdown.replace(/<p>(.*?)<\/p>/gi, '\n$1\n');
  
  // Convert links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Convert bold
  markdown = markdown.replace(/<(strong|b)>(.*?)<\/(strong|b)>/gi, '**$2**');
  
  // Convert italic
  markdown = markdown.replace(/<(em|i)>(.*?)<\/(em|i)>/gi, '*$2*');
  
  // Convert code
  markdown = markdown.replace(/<code>(.*?)<\/code>/gi, '`$1`');
  
  // Convert blockquotes
  markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/gi, '\n> $1\n');
  
  // Convert lists
  markdown = markdown.replace(/<ul>(.*?)<\/ul>/gis, (match, content) => {
    const items = content.match(/<li>(.*?)<\/li>/gi);
    if (!items) return match;
    return '\n' + items.map(item => 
      '- ' + item.replace(/<li>(.*?)<\/li>/i, '$1').trim()
    ).join('\n') + '\n';
  });
  
  markdown = markdown.replace(/<ol>(.*?)<\/ol>/gis, (match, content) => {
    const items = content.match(/<li>(.*?)<\/li>/gi);
    if (!items) return match;
    return '\n' + items.map((item, index) => 
      `${index + 1}. ` + item.replace(/<li>(.*?)<\/li>/i, '$1').trim()
    ).join('\n') + '\n';
  });
  
  // Convert images
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)');
  
  // Convert line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  
  // Clean up HTML entities
  markdown = markdown.replace(/&nbsp;/g, ' ');
  markdown = markdown.replace(/&amp;/g, '&');
  markdown = markdown.replace(/&lt;/g, '<');
  markdown = markdown.replace(/&gt;/g, '>');
  markdown = markdown.replace(/&quot;/g, '"');
  markdown = markdown.replace(/&#39;/g, "'");
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');
  
  // Clean up extra whitespace
  markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
  markdown = markdown.replace(/^\s+|\s+$/g, '');
  
  return markdown;
}

/**
 * Parse RSS feed
 */
function parseRSS(rssContent) {
  const items = [];
  const itemRegex = /<item>(.*?)<\/item>/gs;
  let match;
  
  while ((match = itemRegex.exec(rssContent)) !== null) {
    const itemContent = match[1];
    
    const title = (itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || 
                  itemContent.match(/<title>(.*?)<\/title>/))?.[1] || 'Untitled';
    
    const description = (itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                        itemContent.match(/<description>(.*?)<\/description>/))?.[1] || '';
    
    const content = (itemContent.match(/<content:encoded><!\[CDATA\[(.*?)\]\]><\/content:encoded>/) ||
                    itemContent.match(/<content:encoded>(.*?)<\/content:encoded>/))?.[1] || description;
    
    const pubDate = itemContent.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    
    const link = itemContent.match(/<link>(.*?)<\/link>/)?.[1] || '';
    
    // Extract categories/tags
    const categoryMatches = itemContent.match(/<category>(.*?)<\/category>/g) || [];
    const categories = categoryMatches.map(cat => 
      cat.replace(/<category>(.*?)<\/category>/, '$1').trim()
    );
    
    items.push({
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      pubDate,
      link,
      categories
    });
  }
  
  return items;
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
  const excerpt = extractExcerpt(post.content);
  const readingTime = estimateReadingTime(post.content);
  const publishDate = formatDate(post.pubDate);
  
  // Generate tags from categories and content analysis
  let tags = [...post.categories];
  
  // Add some smart tag detection
  const content = post.content.toLowerCase();
  if (content.includes('finance') || content.includes('market') || content.includes('investment')) {
    tags.push('finance');
  }
  if (content.includes('art') || content.includes('design') || content.includes('creative')) {
    tags.push('art');
  }
  if (content.includes('tech') || content.includes('technology') || content.includes('algorithm')) {
    tags.push('technology');
  }
  if (content.includes('data') || content.includes('visualization') || content.includes('chart')) {
    tags.push('data');
  }
  
  // Remove duplicates and limit to 6 tags
  tags = [...new Set(tags)].slice(0, 6);
  
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
async function importSubstackPosts() {
  try {
    console.log(`Fetching RSS feed from: ${RSS_URL}`);
    const rssContent = await fetchContent(RSS_URL);
    
    console.log('Parsing RSS feed...');
    const posts = parseRSS(rssContent);
    
    console.log(`Found ${posts.length} posts to import`);
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`\nProcessing post ${i + 1}/${posts.length}: ${post.title}`);
      
      // Generate filename
      const slug = generateSlug(post.title);
      const filename = `${slug}.md`;
      const filepath = path.join(BLOG_DIR, filename);
      
      // Skip if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`  Skipping (already exists): ${filename}`);
        continue;
      }
      
      // Convert content to markdown
      let markdownContent = htmlToMarkdown(post.content);
      
      // Process images (download and update paths)
      const imageMatches = markdownContent.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
      for (const imageMatch of imageMatches) {
        const urlMatch = imageMatch.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (urlMatch && urlMatch[2].startsWith('http')) {
          const imageUrl = urlMatch[2];
          const imageExtension = path.extname(imageUrl).split('?')[0] || '.jpg';
          const imageName = `${slug}-${Date.now()}${imageExtension}`;
          
          console.log(`  Downloading image: ${imageName}`);
          const localImagePath = await downloadImage(imageUrl, imageName);
          markdownContent = markdownContent.replace(imageUrl, localImagePath);
        }
      }
      
      // Generate frontmatter
      const frontmatter = generateFrontmatter(post);
      
      // Combine frontmatter and content
      const finalContent = `${frontmatter}\n\n${markdownContent}`;
      
      // Write file
      fs.writeFileSync(filepath, finalContent, 'utf8');
      console.log(`  Created: ${filename}`);
      
      // Add small delay to be respectful to servers
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Import complete! Imported ${posts.length} posts to ${BLOG_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Review the imported posts in src/content/blog/');
    console.log('2. Edit any frontmatter as needed');
    console.log('3. Test your blog with: npm run dev');
    console.log('4. Build and deploy: npm run build');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check that your Substack URL is correct');
    console.log('2. Ensure your Substack has public RSS enabled');
    console.log('3. Check your internet connection');
    console.log('4. Try running the script again in a few minutes');
  }
}

// Run the import
if (require.main === module) {
  importSubstackPosts();
}

module.exports = { importSubstackPosts };