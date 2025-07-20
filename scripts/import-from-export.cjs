#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Complete Substack Import from Export Data
 * Processes all 106 posts from the Substack export
 */

const EXPORT_DIR = path.join(__dirname, '.');
const POSTS_CSV = path.join(EXPORT_DIR, 'posts.csv');
const POSTS_HTML_DIR = path.join(EXPORT_DIR, 'posts');
const BLOG_DIR = path.join(__dirname, '../src/content/blog');

// Ensure blog directory exists
if (!fs.existsSync(BLOG_DIR)) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
}

/**
 * Parse CSV data
 */
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  const posts = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= headers.length) {
      const post = {};
      headers.forEach((header, index) => {
        post[header] = values[index] || '';
      });
      posts.push(post);
    }
  }

  return posts;
}

/**
 * Parse CSV line handling commas in quoted strings
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
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
 * Convert HTML to Markdown
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
  
  // Convert code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  
  // Convert blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\n> $1\n');
  
  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (!items) return match;
    return '\n' + items.map(item => 
      '- ' + item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').trim()
    ).join('\n') + '\n';
  });
  
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (!items) return match;
    return '\n' + items.map((item, index) => 
      `${index + 1}. ` + item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').trim()
    ).join('\n') + '\n';
  });
  
  // Convert images
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)');
  
  // Handle iframes (like Bandcamp embeds)
  markdown = markdown.replace(/<iframe[^>]*src="([^"]*)"[^>]*><\/iframe>/gi, '\n[Embedded content: $1]\n');
  
  // Handle divs with embeds
  markdown = markdown.replace(/<div[^>]*class="[^"]*embed[^"]*"[^>]*>(.*?)<\/div>/gis, '\n$1\n');
  markdown = markdown.replace(/<div[^>]*class="[^"]*bandcamp[^"]*"[^>]*>(.*?)<\/div>/gis, '\n$1\n');
  
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
  markdown = markdown.replace(/&#8211;/g, '–');
  
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
function generateFrontmatter(post, content) {
  const excerpt = extractExcerpt(content);
  const readingTime = estimateReadingTime(content);
  const publishDate = formatDate(post.post_date);
  
  // Generate tags from content analysis
  let tags = [];
  
  const contentLower = content.toLowerCase();
  const titleLower = post.title.toLowerCase();
  const combinedContent = (contentLower + ' ' + titleLower);
  
  if (combinedContent.includes('finance') || combinedContent.includes('market') || combinedContent.includes('investment') || combinedContent.includes('defi') || combinedContent.includes('tradfi')) {
    tags.push('finance');
  }
  if (combinedContent.includes('art') || combinedContent.includes('design') || combinedContent.includes('creative') || combinedContent.includes('nft') || combinedContent.includes('gallery')) {
    tags.push('art');
  }
  if (combinedContent.includes('tech') || combinedContent.includes('technology') || combinedContent.includes('algorithm') || combinedContent.includes('ai') || combinedContent.includes('llm')) {
    tags.push('technology');
  }
  if (combinedContent.includes('crypto') || combinedContent.includes('bitcoin') || combinedContent.includes('ethereum') || combinedContent.includes('blockchain') || combinedContent.includes('onchain')) {
    tags.push('crypto');
  }
  if (combinedContent.includes('data') || combinedContent.includes('visualization') || combinedContent.includes('chart') || combinedContent.includes('dashboard')) {
    tags.push('data');
  }
  if (combinedContent.includes('culture') || combinedContent.includes('social') || combinedContent.includes('network') || combinedContent.includes('community')) {
    tags.push('culture');
  }
  if (combinedContent.includes('writing') || combinedContent.includes('literature') || combinedContent.includes('novel') || combinedContent.includes('book') || combinedContent.includes('poem')) {
    tags.push('writing');
  }
  if (combinedContent.includes('music') || combinedContent.includes('album') || combinedContent.includes('sound') || combinedContent.includes('jazz') || combinedContent.includes('bandcamp')) {
    tags.push('music');
  }
  
  // Default to general if no tags found
  if (tags.length === 0) {
    tags.push('general');
  }
  
  // Limit to 5 tags and remove duplicates
  tags = [...new Set(tags)].slice(0, 5);
  
  // Clean title and subtitle for frontmatter
  const cleanTitle = post.title.replace(/"/g, '\\"');
  const cleanSubtitle = (post.subtitle || '').replace(/"/g, '\\"');
  const description = cleanSubtitle || excerpt.replace(/"/g, '\\"');
  
  const frontmatter = `---
title: "${cleanTitle}"
description: "${description}"
publishDate: ${publishDate}
author: "Gokhan Turhan"
tags: [${tags.map(tag => `"${tag}"`).join(', ')}]
category: "${tags[0] || 'general'}"
featured: false
readingTime: ${readingTime}
excerpt: "${excerpt.replace(/"/g, '\\"')}"
originalUrl: "https://gokhan.substack.com/p/${post.post_id.split('.')[1] || post.post_id}"
---`;
  
  return frontmatter;
}

/**
 * Get existing blog post filenames to avoid duplicates
 */
function getExistingPosts() {
  try {
    const files = fs.readdirSync(BLOG_DIR);
    return files.filter(file => file.endsWith('.md')).map(file => file.replace('.md', ''));
  } catch (error) {
    return [];
  }
}

/**
 * Main import function
 */
async function importFromExport() {
  try {
    console.log('Starting import from Substack export data...');
    
    // Read CSV file
    if (!fs.existsSync(POSTS_CSV)) {
      console.error('❌ posts.csv not found in scripts directory');
      return;
    }
    
    const csvContent = fs.readFileSync(POSTS_CSV, 'utf8');
    const posts = parseCSV(csvContent);
    
    console.log(`Found ${posts.length} posts in CSV`);
    
    // Filter for published posts only
    const publishedPosts = posts.filter(post => 
      post.is_published === 'true' && 
      post.title && 
      post.title.trim() !== ''
    );
    
    console.log(`Found ${publishedPosts.length} published posts`);
    
    // Get existing posts to avoid duplicates
    const existingSlugs = getExistingPosts();
    console.log(`Found ${existingSlugs.length} existing blog posts`);
    
    let imported = 0;
    let skipped = 0;
    
    for (let i = 0; i < publishedPosts.length; i++) {
      const post = publishedPosts[i];
      console.log(`\nProcessing post ${i + 1}/${publishedPosts.length}: ${post.title}`);
      
      // Generate slug
      const slug = generateSlug(post.title);
      if (!slug) {
        console.log(`  Skipping: Could not generate slug from title`);
        skipped++;
        continue;
      }
      
      // Check if already exists
      if (existingSlugs.includes(slug)) {
        console.log(`  Skipping: Post already exists (${slug}.md)`);
        skipped++;
        continue;
      }
      
      // Find corresponding HTML file
      const postId = post.post_id.split('.')[0];
      const htmlFilename = `${post.post_id}.html`;
      const htmlPath = path.join(POSTS_HTML_DIR, htmlFilename);
      
      if (!fs.existsSync(htmlPath)) {
        console.log(`  Skipping: HTML file not found (${htmlFilename})`);
        skipped++;
        continue;
      }
      
      // Read HTML content
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      if (!htmlContent.trim()) {
        console.log(`  Skipping: Empty HTML content`);
        skipped++;
        continue;
      }
      
      // Convert to markdown
      const markdownContent = htmlToMarkdown(htmlContent);
      
      // Generate frontmatter
      const frontmatter = generateFrontmatter(post, markdownContent);
      
      // Combine frontmatter and content
      const finalContent = `${frontmatter}\n\n${markdownContent}`;
      
      // Write file
      const filename = `${slug}.md`;
      const filepath = path.join(BLOG_DIR, filename);
      
      fs.writeFileSync(filepath, finalContent, 'utf8');
      console.log(`  ✅ Created: ${filename}`);
      imported++;
    }
    
    console.log(`\n🎉 Import complete!`);
    console.log(`✅ Imported: ${imported} posts`);
    console.log(`⏭️  Skipped: ${skipped} posts`);
    console.log(`📁 Location: ${BLOG_DIR}`);
    
    console.log('\n🚀 Next steps:');
    console.log('1. Review the imported posts in src/content/blog/');
    console.log('2. Check for any formatting issues');
    console.log('3. Test your blog with: npm run dev');
    console.log('4. Build and deploy: npm run build');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error.stack);
  }
}

// Run the import
importFromExport();