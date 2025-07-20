#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Complete Substack Importer - Gets ALL posts via archive scraping
 * Handles 106+ posts from gokhan.substack.com
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
 * Fetch content from URL with user agent
 */
async function fetchContent(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      },
      ...options
    };

    https.get(url, requestOptions, (res) => {
      let data = '';
      
      // Handle gzip encoding
      if (res.headers['content-encoding'] === 'gzip') {
        const zlib = require('zlib');
        const gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        gunzip.on('data', chunk => data += chunk);
        gunzip.on('end', () => resolve(data));
        gunzip.on('error', reject);
      } else {
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }
    }).on('error', reject);
  });
}

/**
 * Get all post URLs from Substack archive
 */
async function getAllPostUrls() {
  console.log('Fetching all post URLs from Substack archive...');
  const urls = [];
  let page = 0;
  let hasMore = true;

  while (hasMore && page < 20) { // Safety limit
    try {
      console.log(`  Fetching archive page ${page + 1}...`);
      const archiveUrl = `https://${SUBSTACK_URL}/archive?sort=new&search=&offset=${page * 12}`;
      const html = await fetchContent(archiveUrl);
      
      // Extract post URLs from HTML
      const postUrlRegex = /href="(\/p\/[^"]+)"/g;
      const pageUrls = [];
      let match;
      
      while ((match = postUrlRegex.exec(html)) !== null) {
        const postPath = match[1];
        const fullUrl = `https://${SUBSTACK_URL}${postPath}`;
        if (!urls.includes(fullUrl)) {
          pageUrls.push(fullUrl);
          urls.push(fullUrl);
        }
      }
      
      console.log(`    Found ${pageUrls.length} posts on page ${page + 1}`);
      
      // If we got less than expected, we've reached the end
      if (pageUrls.length < 10) {
        hasMore = false;
      }
      
      page++;
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`    Error fetching page ${page + 1}: ${error.message}`);
      hasMore = false;
    }
  }
  
  console.log(`Found ${urls.length} total posts`);
  return urls;
}

/**
 * Extract post data from individual post page
 */
async function extractPostData(postUrl) {
  try {
    const html = await fetchContent(postUrl);
    
    // Extract title
    const titleMatch = html.match(/<h1[^>]*class="[^"]*post-title[^"]*"[^>]*>(.*?)<\/h1>/s) ||
                     html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : 'Untitled';
    
    // Extract content
    const contentMatch = html.match(/<div[^>]*class="[^"]*available-content[^"]*"[^>]*>(.*?)<\/div>/s) ||
                        html.match(/<div[^>]*class="[^"]*post-content[^"]*"[^>]*>(.*?)<\/div>/s) ||
                        html.match(/<article[^>]*>(.*?)<\/article>/s);
    const content = contentMatch ? contentMatch[1] : '';
    
    // Extract publish date
    const dateMatch = html.match(/<time[^>]*datetime="([^"]*)"/) ||
                     html.match(/published on ([^<]+)/i);
    const pubDate = dateMatch ? dateMatch[1] : new Date().toISOString();
    
    // Extract description/subtitle
    const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/) ||
                     html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/) ||
                     html.match(/<h2[^>]*class="[^"]*subtitle[^"]*"[^>]*>(.*?)<\/h2>/);
    const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';
    
    return {
      title: title.replace(/&[^;]+;/g, '').trim(),
      content: content.trim(),
      description: description.replace(/&[^;]+;/g, '').trim(),
      pubDate,
      link: postUrl,
      categories: []
    };
    
  } catch (error) {
    console.log(`    Error extracting data from ${postUrl}: ${error.message}`);
    return null;
  }
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
    console.log(`    Failed to download image: ${imageUrl}`);
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
function generateFrontmatter(post) {
  const excerpt = extractExcerpt(post.content);
  const readingTime = estimateReadingTime(post.content);
  const publishDate = formatDate(post.pubDate);
  
  // Generate tags from content analysis
  let tags = [];
  
  const content = post.content.toLowerCase();
  if (content.includes('finance') || content.includes('market') || content.includes('investment') || content.includes('defi') || content.includes('tradfi')) {
    tags.push('finance');
  }
  if (content.includes('art') || content.includes('design') || content.includes('creative') || content.includes('nft')) {
    tags.push('art');
  }
  if (content.includes('tech') || content.includes('technology') || content.includes('algorithm') || content.includes('ai') || content.includes('llm')) {
    tags.push('technology');
  }
  if (content.includes('crypto') || content.includes('bitcoin') || content.includes('ethereum') || content.includes('blockchain') || content.includes('onchain')) {
    tags.push('crypto');
  }
  if (content.includes('data') || content.includes('visualization') || content.includes('chart') || content.includes('dashboard')) {
    tags.push('data');
  }
  if (content.includes('culture') || content.includes('social') || content.includes('network') || content.includes('community')) {
    tags.push('culture');
  }
  
  // Default to general if no tags found
  if (tags.length === 0) {
    tags.push('general');
  }
  
  // Limit to 5 tags
  tags = tags.slice(0, 5);
  
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
async function importAllSubstackPosts() {
  try {
    console.log(`Starting complete import from ${SUBSTACK_URL}...`);
    
    // Get all post URLs
    const postUrls = await getAllPostUrls();
    
    if (postUrls.length === 0) {
      console.log('No posts found. Trying RSS fallback...');
      
      // Fallback to RSS if archive scraping failed
      const rssUrl = `https://${SUBSTACK_URL}/feed`;
      const rssContent = await fetchContent(rssUrl);
      
      // Parse RSS (simplified)
      const itemMatches = rssContent.match(/<item>(.*?)<\/item>/gs) || [];
      for (const item of itemMatches) {
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        if (linkMatch) {
          postUrls.push(linkMatch[1].trim());
        }
      }
    }
    
    console.log(`Found ${postUrls.length} posts to import`);
    
    let imported = 0;
    let skipped = 0;
    
    for (let i = 0; i < postUrls.length; i++) {
      const postUrl = postUrls[i];
      console.log(`\nProcessing post ${i + 1}/${postUrls.length}:`);
      console.log(`  URL: ${postUrl}`);
      
      try {
        // Extract post data
        const post = await extractPostData(postUrl);
        
        if (!post || !post.title) {
          console.log(`  Skipping: Unable to extract post data`);
          skipped++;
          continue;
        }
        
        console.log(`  Title: ${post.title}`);
        
        // Generate filename
        const slug = generateSlug(post.title);
        const filename = `${slug}.md`;
        const filepath = path.join(BLOG_DIR, filename);
        
        // Skip if file already exists
        if (fs.existsSync(filepath)) {
          console.log(`  Skipping: File already exists (${filename})`);
          skipped++;
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
            
            console.log(`    Downloading image: ${imageName}`);
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
        console.log(`  ✅ Created: ${filename}`);
        imported++;
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`  ❌ Error processing ${postUrl}: ${error.message}`);
        skipped++;
      }
    }
    
    console.log(`\n🎉 Import complete!`);
    console.log(`✅ Imported: ${imported} posts`);
    console.log(`⏭️  Skipped: ${skipped} posts`);
    console.log(`📁 Location: ${BLOG_DIR}`);
    
    console.log('\n🚀 Next steps:');
    console.log('1. Review the imported posts in src/content/blog/');
    console.log('2. Edit any frontmatter as needed');
    console.log('3. Test your blog with: npm run dev');
    console.log('4. Build and deploy: npm run build');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check that your Substack URL is correct');
    console.log('2. Ensure your Substack is publicly accessible');
    console.log('3. Check your internet connection');
    console.log('4. Try running the script again in a few minutes');
  }
}

// Run the import
importAllSubstackPosts();