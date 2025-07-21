#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * PROPER Substack Importer - Actually downloads images and fixes content
 * This is what I should have built from the start
 */

const EXPORT_DIR = path.join(__dirname, '.');
const POSTS_CSV = path.join(EXPORT_DIR, 'posts.csv');
const POSTS_HTML_DIR = path.join(EXPORT_DIR, 'posts');
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
 * ACTUALLY download images (what I should have done)
 */
async function downloadImageProperly(imageUrl, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(IMAGES_DIR, filename));
    
    https.get(imageUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve(`/blog/images/${filename}`);
      });
      
      file.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Process embedded content properly (what I should have done)
 */
function processEmbeds(content) {
  // Convert Substack embeds to proper Astro components
  
  // YouTube embeds
  content = content.replace(
    /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g,
    '<YouTubeEmbed id="$1" />'
  );
  
  // Twitter/X embeds
  content = content.replace(
    /https:\/\/(?:twitter|x)\.com\/\w+\/status\/(\d+)/g,
    '<TwitterEmbed id="$1" />'
  );
  
  // Spotify embeds
  content = content.replace(
    /https:\/\/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/g,
    '<SpotifyEmbed type="$1" id="$2" />'
  );
  
  return content;
}

/**
 * Fix bookmark formatting (what I should have done)
 */
function fixBookmarkLinks(content) {
  // Convert embedded newsletter previews to clean links
  content = content.replace(
    /\[([^\]]+)\]\(([^)]+)\?utm_source=substack[^)]*\)/g,
    '[$1]($2)'
  );
  
  // Clean up Substack embed HTML
  content = content.replace(
    /<div class="subscription-widget-wrap".*?<\/div>/gs,
    ''
  );
  
  // Convert embedded article previews to clean markdown links
  content = content.replace(
    /\!\[([^\]]*)\]\(([^)]+)\)\s*\[([^\]]+)\]\(([^)]+)\)/g,
    '**[$3]($4)**\n\n*$1*'
  );
  
  return content;
}

/**
 * Process images properly (what I should have done)
 */
async function processImages(content, postSlug) {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  let processedContent = content;
  
  while ((match = imageRegex.exec(content)) !== null) {
    const [fullMatch, altText, imageUrl] = match;
    
    if (imageUrl.startsWith('http')) {
      try {
        const extension = path.extname(new URL(imageUrl).pathname) || '.jpg';
        const filename = `${postSlug}-${Date.now()}${extension}`;
        
        const localPath = await downloadImageProperly(imageUrl, filename);
        processedContent = processedContent.replace(fullMatch, `![${altText}](${localPath})`);
        
        // Add a small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`❌ Failed to download image: ${imageUrl}`);
      }
    }
  }
  
  return processedContent;
}

/**
 * Fix dates properly (what I should have done)
 */
function fixDate(csvDate) {
  try {
    const date = new Date(csvDate);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.log(`❌ Invalid date: ${csvDate}`);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Parse CSV properly
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"' && (i === 0 || line[i - 1] === ',')) {
      inQuotes = true;
    } else if (char === '"' && nextChar === ',') {
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else if (char !== '"' || inQuotes) {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

/**
 * Main import function (what I should have built)
 */
async function properImport() {
  try {
    console.log('🚀 Starting PROPER Substack import...');
    
    // Read and parse CSV
    const csvContent = fs.readFileSync(POSTS_CSV, 'utf8');
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
    
    // Filter published posts
    const publishedPosts = posts.filter(post => 
      post.is_published === 'true' && 
      post.title && 
      post.title.trim() !== '' &&
      !post.title.startsWith('join-my-')
    );
    
    console.log(`📊 Found ${publishedPosts.length} published posts`);
    
    let processed = 0;
    
    for (const post of publishedPosts) {
      try {
        console.log(`\n📝 Processing: ${post.title}`);
        
        // Generate slug
        const slug = post.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        
        const filename = `${slug}.md`;
        const outputPath = path.join(BLOG_DIR, filename);
        
        // Skip if exists
        if (fs.existsSync(outputPath)) {
          console.log(`⏭️  Skipping: ${filename} exists`);
          continue;
        }
        
        // Find HTML file
        const htmlFilename = `${post.post_id}.${slug}.html`;
        const htmlPath = path.join(POSTS_HTML_DIR, htmlFilename);
        
        if (!fs.existsSync(htmlPath)) {
          console.log(`❌ HTML file not found: ${htmlFilename}`);
          continue;
        }
        
        // Read and process HTML
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Convert to markdown
        let markdown = htmlToMarkdownProperly(htmlContent);
        
        // Fix embeds
        markdown = processEmbeds(markdown);
        
        // Fix bookmarks
        markdown = fixBookmarkLinks(markdown);
        
        // Process images (ACTUALLY download them)
        markdown = await processImages(markdown, slug);
        
        // Fix date
        const publishDate = fixDate(post.post_date);
        
        // Generate frontmatter
        const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
description: "${(post.subtitle || '').replace(/"/g, '\\"')}"
publishDate: ${publishDate}
author: "Gokhan Turhan"
tags: ["finance", "technology", "crypto"]
category: "finance"
featured: false
readingTime: ${Math.ceil(markdown.split(' ').length / 200)}
excerpt: "${markdown.substring(0, 200).replace(/"/g, '\\"')}..."
originalUrl: "https://gokhan.substack.com/p/${slug}"
---`;
        
        // Write file
        const finalContent = `${frontmatter}\n\n${markdown}`;
        fs.writeFileSync(outputPath, finalContent, 'utf8');
        
        console.log(`✅ Created: ${filename}`);
        processed++;
        
        // Delay between posts
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ Error processing ${post.title}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Import complete! Processed ${processed} posts`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

/**
 * Better HTML to Markdown conversion
 */
function htmlToMarkdownProperly(html) {
  let markdown = html;
  
  // Remove script tags
  markdown = markdown.replace(/<script[^>]*>.*?<\/script>/gis, '');
  
  // Convert headers
  markdown = markdown.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, content) => {
    const hashes = '#'.repeat(parseInt(level));
    return `\n${hashes} ${content.trim()}\n`;
  });
  
  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');
  
  // Convert links properly
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Convert bold/italic
  markdown = markdown.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, '**$2**');
  markdown = markdown.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, '*$2*');
  
  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    return '\n' + items.map(item => 
      '- ' + item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').trim()
    ).join('\n') + '\n';
  });
  
  // Clean HTML entities
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#8217;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8212;': '—'
  };
  
  Object.entries(entities).forEach(([entity, replacement]) => {
    markdown = markdown.replace(new RegExp(entity, 'g'), replacement);
  });
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');
  
  // Clean up whitespace
  markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
  markdown = markdown.trim();
  
  return markdown;
}

// Export for use
module.exports = {
  properImport,
  downloadImageProperly,
  processEmbeds,
  fixBookmarkLinks,
  processImages
};

if (require.main === module) {
  properImport();
}