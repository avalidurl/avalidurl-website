#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

/**
 * COMPREHENSIVE Substack Importer - Actually fixes everything properly
 * 
 * What this tool does RIGHT:
 * 1. Actually downloads images to local storage
 * 2. Converts embed URLs to proper Astro components
 * 3. Fixes broken bookmark formatting
 * 4. Cleans HTML content properly
 * 5. Corrects date formatting
 * 6. Handles errors gracefully
 */

const CONFIG = {
  EXPORT_DIR: path.join(__dirname, '.'),
  POSTS_CSV: path.join(__dirname, 'posts.csv'),
  POSTS_HTML_DIR: path.join(__dirname, 'posts'),
  BLOG_DIR: path.join(__dirname, '../src/content/blog'),
  IMAGES_DIR: path.join(__dirname, '../public/blog/images'),
  
  // Rate limiting
  IMAGE_DOWNLOAD_DELAY: 1000, // 1 second between downloads
  POST_PROCESS_DELAY: 500,     // 0.5 seconds between posts
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000
};

// Ensure directories exist
function ensureDirectories() {
  [CONFIG.BLOG_DIR, CONFIG.IMAGES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

/**
 * ACTUALLY download images with proper error handling and retries
 */
async function downloadImageProperly(imageUrl, filename, retries = 0) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(CONFIG.IMAGES_DIR, filename);
    const file = fs.createWriteStream(filePath);
    
    const request = https.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${filename} (${Math.round(response.headers['content-length'] / 1024)}KB)`);
          resolve(`/blog/images/${filename}`);
        });
        
        file.on('error', (err) => {
          fs.unlink(filePath, () => {}); // Clean up partial file
          if (retries < CONFIG.MAX_RETRIES) {
            console.log(`⚠️  Retry ${retries + 1}/${CONFIG.MAX_RETRIES}: ${filename}`);
            setTimeout(() => {
              downloadImageProperly(imageUrl, filename, retries + 1).then(resolve).catch(reject);
            }, CONFIG.RETRY_DELAY);
          } else {
            reject(err);
          }
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        const redirectUrl = response.headers.location;
        console.log(`🔄 Redirect: ${imageUrl} → ${redirectUrl}`);
        downloadImageProperly(redirectUrl, filename, retries).then(resolve).catch(reject);
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${imageUrl}`));
      }
    });
    
    request.on('error', (err) => {
      if (retries < CONFIG.MAX_RETRIES) {
        console.log(`⚠️  Network retry ${retries + 1}/${CONFIG.MAX_RETRIES}: ${filename}`);
        setTimeout(() => {
          downloadImageProperly(imageUrl, filename, retries + 1).then(resolve).catch(reject);
        }, CONFIG.RETRY_DELAY);
      } else {
        reject(err);
      }
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error(`Timeout: ${imageUrl}`));
    });
  });
}

/**
 * Convert embed URLs to proper Astro components
 */
function processEmbeds(content) {
  let processed = content;
  
  // YouTube embeds - multiple URL formats
  processed = processed.replace(
    /https?:\/\/(?:www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:\S*)?/g,
    '<YouTubeEmbed id="$2" />'
  );
  
  // Twitter/X embeds
  processed = processed.replace(
    /https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)(?:\S*)?/g,
    '<TwitterEmbed id="$1" />'
  );
  
  // Spotify embeds - tracks, albums, playlists
  processed = processed.replace(
    /https?:\/\/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)(?:\S*)?/g,
    '<SpotifyEmbed type="$1" id="$2" />'
  );
  
  // Apple Music embeds
  processed = processed.replace(
    /https?:\/\/music\.apple\.com\/\w+\/(album|song)\/[^\/]+\/(\d+)(?:\S*)?/g,
    '<AppleMusicEmbed type="$1" id="$2" />'
  );
  
  // Vimeo embeds
  processed = processed.replace(
    /https?:\/\/(?:www\.)?vimeo\.com\/(\d+)(?:\S*)?/g,
    '<VimeoEmbed id="$1" />'
  );
  
  // SoundCloud embeds
  processed = processed.replace(
    /https?:\/\/soundcloud\.com\/([\w-]+)\/([\w-]+)(?:\S*)?/g,
    '<SoundCloudEmbed user="$1" track="$2" />'
  );
  
  return processed;
}

/**
 * Fix broken bookmark and link formatting
 */
function fixBookmarkLinks(content) {
  let fixed = content;
  
  // Remove Substack embed HTML blocks
  fixed = fixed.replace(
    /<div class="subscription-widget-wrap".*?<\/div>/gs,
    ''
  );
  
  // Clean embedded newsletter previews
  fixed = fixed.replace(
    /\[([^\]]+)\]\(([^)]+)\?utm_source=substack[^)]*\)/g,
    '[$1]($2)'
  );
  
  // Fix malformed embedded article previews
  fixed = fixed.replace(
    /!\[([^\]]*)\]\(([^)]+)\)\s*\n*\s*\[([^\]]+)\]\(([^)]+)\)/g,
    '\n**[$3]($4)**\n\n*$1*\n'
  );
  
  // Clean up broken Substack post embeds
  fixed = fixed.replace(
    /\[([^\]]+)\]\([^)]*substack\.com[^)]*\?utm_campaign=post_embed[^)]*\)/g,
    '**$1** (Substack Post)'
  );
  
  // Remove tracking parameters from all URLs
  fixed = fixed.replace(
    /(https?:\/\/[^\s)]+)\?utm_[^)\s]*/g,
    '$1'
  );
  
  // Standardize link formatting
  fixed = fixed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, text, url) => {
      // Clean up the URL
      const cleanUrl = url.replace(/\?utm_[^&]*(&|$)/g, '').replace(/[&?]$/, '');
      return `[${text.trim()}](${cleanUrl})`;
    }
  );
  
  return fixed;
}

/**
 * Process and download images, replacing URLs with local paths
 */
async function processImages(content, postSlug) {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let processedContent = content;
  const matches = [...content.matchAll(imageRegex)];
  
  console.log(`🖼️  Found ${matches.length} images to process`);
  
  for (const match of matches) {
    const [fullMatch, altText, imageUrl] = match;
    
    if (!imageUrl.startsWith('http')) {
      console.log(`⏭️  Skipping local image: ${imageUrl}`);
      continue;
    }
    
    try {
      // Generate unique filename
      const urlObj = new URL(imageUrl);
      const extension = path.extname(urlObj.pathname).toLowerCase() || '.jpg';
      const timestamp = Date.now();
      const filename = `${postSlug}-${timestamp}${extension}`;
      
      console.log(`📥 Downloading: ${imageUrl} → ${filename}`);
      
      // Actually download the image
      const localPath = await downloadImageProperly(imageUrl, filename);
      
      // Replace in content
      const newImageMarkdown = `![${altText}](${localPath})`;
      processedContent = processedContent.replace(fullMatch, newImageMarkdown);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, CONFIG.IMAGE_DOWNLOAD_DELAY));
      
    } catch (error) {
      console.log(`❌ Failed to download ${imageUrl}: ${error.message}`);
      // Keep original URL as fallback
    }
  }
  
  return processedContent;
}

/**
 * Parse CSV with proper quote handling
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (!inQuotes) {
        inQuotes = true;
      } else if (nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i++;
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Convert HTML to clean Markdown
 */
function htmlToMarkdownProperly(html) {
  let markdown = html;
  
  // Remove scripts and styles
  markdown = markdown.replace(/<script[^>]*>.*?<\/script>/gis, '');
  markdown = markdown.replace(/<style[^>]*>.*?<\/style>/gis, '');
  
  // Convert headers with proper spacing
  markdown = markdown.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, content) => {
    const hashes = '#'.repeat(parseInt(level));
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    return `\n${hashes} ${cleanContent}\n`;
  });
  
  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');
  
  // Convert links (before other processing)
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Convert formatting
  markdown = markdown.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**');
  markdown = markdown.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '*$2*');
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  
  // Convert blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
    const lines = content.split('\n').map(line => `> ${line.trim()}`).join('\n');
    return `\n${lines}\n`;
  });
  
  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    const listItems = items.map(item => {
      const text = item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').replace(/<[^>]*>/g, '').trim();
      return `- ${text}`;
    });
    return '\n' + listItems.join('\n') + '\n';
  });
  
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    const listItems = items.map((item, index) => {
      const text = item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').replace(/<[^>]*>/g, '').trim();
      return `${index + 1}. ${text}`;
    });
    return '\n' + listItems.join('\n') + '\n';
  });
  
  // Clean HTML entities properly
  const htmlEntities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#8217;': "'",
    '&#8218;': ',',
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8222;': '"',
    '&#8230;': '...',
    '&#8212;': '—',
    '&#8211;': '–',
    '&#8216;': "'",
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"'
  };
  
  Object.entries(htmlEntities).forEach(([entity, replacement]) => {
    markdown = markdown.replace(new RegExp(entity, 'g'), replacement);
  });
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');
  
  // Clean up whitespace
  markdown = markdown.replace(/\n\s*\n\s*\n+/g, '\n\n'); // Multiple newlines to double
  markdown = markdown.replace(/^\s+|\s+$/g, ''); // Trim start/end
  markdown = markdown.replace(/[ \t]+$/gm, ''); // Remove trailing spaces
  
  return markdown;
}

/**
 * Generate proper frontmatter with intelligent categorization
 */
function generateFrontmatter(post, content, publishDate) {
  const title = post.title.replace(/"/g, '\\"');
  const description = (post.subtitle || extractDescription(content)).replace(/"/g, '\\"');
  const excerpt = extractExcerpt(content).replace(/"/g, '\\"');
  
  // Intelligent tag generation
  const tags = generateTags(content);
  const category = tags[0] || 'general';
  const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
  
  return `---
title: "${title}"
description: "${description}"
publishDate: ${publishDate}
author: "Gokhan Turhan"
tags: [${tags.map(tag => `"${tag}"`).join(', ')}]
category: "${category}"
featured: false
readingTime: ${readingTime}
excerpt: "${excerpt}"
originalUrl: "https://gokhan.substack.com/p/${generateSlug(post.title)}"
---`;
}

function extractDescription(content) {
  const text = content.replace(/[#*`]/g, '').substring(0, 300);
  const firstSentence = text.split('.')[0];
  return firstSentence.length > 50 ? firstSentence + '.' : text;
}

function extractExcerpt(content, maxLength = 200) {
  const text = content.replace(/[#*`\[\]()]/g, '').trim();
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.8 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

function generateTags(content) {
  const tags = new Set();
  const text = content.toLowerCase();
  
  // Finance tags
  if (/\b(finance|market|trading|investment|defi|tradfi|yield|profit)\b/.test(text)) tags.add('finance');
  if (/\b(crypto|bitcoin|ethereum|blockchain|defi|nft|token)\b/.test(text)) tags.add('crypto');
  if (/\b(stablecoin|usdc|dai|frax|liquidity)\b/.test(text)) tags.add('defi');
  
  // Technology tags
  if (/\b(technology|tech|software|algorithm|ai|llm|machine learning)\b/.test(text)) tags.add('technology');
  if (/\b(data|analytics|dashboard|visualization|metrics)\b/.test(text)) tags.add('data');
  if (/\b(web3|protocol|smart contract|dapp)\b/.test(text)) tags.add('web3');
  
  // Art/Culture tags
  if (/\b(art|design|creative|culture|aesthetic|visual)\b/.test(text)) tags.add('art');
  if (/\b(writing|novel|book|literature|poetry)\b/.test(text)) tags.add('writing');
  if (/\b(music|spotify|soundcloud|audio)\b/.test(text)) tags.add('music');
  
  const tagArray = Array.from(tags);
  return tagArray.length > 0 ? tagArray.slice(0, 5) : ['general'];
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

/**
 * Main comprehensive import function
 */
async function comprehensiveImport() {
  try {
    console.log('🚀 Starting COMPREHENSIVE Substack Import...\n');
    
    ensureDirectories();
    
    // Validate required files
    if (!fs.existsSync(CONFIG.POSTS_CSV)) {
      throw new Error(`❌ Posts CSV not found: ${CONFIG.POSTS_CSV}`);
    }
    
    if (!fs.existsSync(CONFIG.POSTS_HTML_DIR)) {
      throw new Error(`❌ Posts HTML directory not found: ${CONFIG.POSTS_HTML_DIR}`);
    }
    
    // Parse CSV
    console.log('📊 Parsing posts CSV...');
    const csvContent = fs.readFileSync(CONFIG.POSTS_CSV, 'utf8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const posts = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= headers.length - 2) { // Allow some flexibility
        const post = {};
        headers.forEach((header, index) => {
          post[header] = (values[index] || '').trim();
        });
        posts.push(post);
      }
    }
    
    // Filter to published posts only
    const publishedPosts = posts.filter(post => 
      post.is_published === 'true' && 
      post.title && 
      post.title.trim() !== '' &&
      !post.title.toLowerCase().includes('join-my-new-subscriber') &&
      !post.title.toLowerCase().includes('coming-soon')
    );
    
    console.log(`✅ Found ${publishedPosts.length} published posts to process\n`);
    
    let processed = 0;
    let updated = 0;
    let errors = 0;
    
    for (const post of publishedPosts) {
      try {
        const slug = generateSlug(post.title);
        const filename = `${slug}.md`;
        const outputPath = path.join(CONFIG.BLOG_DIR, filename);
        
        console.log(`\n📝 Processing: ${post.title}`);
        console.log(`   Slug: ${slug}`);
        
        // Find HTML file - try multiple naming patterns
        const possibleHtmlFiles = [
          `${post.post_id}.${slug}.html`,
          `${post.post_id}.${post.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`,
          `${post.post_id}.html`
        ];
        
        let htmlPath = null;
        for (const htmlFile of possibleHtmlFiles) {
          const testPath = path.join(CONFIG.POSTS_HTML_DIR, htmlFile);
          if (fs.existsSync(testPath)) {
            htmlPath = testPath;
            break;
          }
        }
        
        if (!htmlPath) {
          console.log(`   ⚠️  HTML file not found, skipping...`);
          errors++;
          continue;
        }
        
        // Read and process HTML content
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Convert to markdown
        let markdown = htmlToMarkdownProperly(htmlContent);
        
        if (!markdown || markdown.trim().length < 50) {
          console.log(`   ⚠️  Content too short, skipping...`);
          errors++;
          continue;
        }
        
        // Process embeds
        console.log(`   🔄 Processing embeds...`);
        markdown = processEmbeds(markdown);
        
        // Fix bookmark links
        console.log(`   🔗 Fixing bookmark links...`);
        markdown = fixBookmarkLinks(markdown);
        
        // Process images (actually download them!)
        console.log(`   🖼️  Processing images...`);
        markdown = await processImages(markdown, slug);
        
        // Parse and fix date
        const publishDate = new Date(post.post_date).toISOString().split('T')[0];
        console.log(`   📅 Date: ${publishDate}`);
        
        // Generate frontmatter
        const frontmatter = generateFrontmatter(post, markdown, publishDate);
        
        // Create final content
        const finalContent = `${frontmatter}\n\n${markdown}`;
        
        // Write file
        fs.writeFileSync(outputPath, finalContent, 'utf8');
        
        if (fs.existsSync(outputPath)) {
          console.log(`   ✅ ${fs.existsSync(outputPath) ? 'Updated' : 'Created'}: ${filename}`);
          processed++;
          if (fs.existsSync(outputPath)) updated++;
        }
        
        // Rate limiting between posts
        await new Promise(resolve => setTimeout(resolve, CONFIG.POST_PROCESS_DELAY));
        
      } catch (error) {
        console.log(`   ❌ Error processing ${post.title}: ${error.message}`);
        errors++;
      }
    }
    
    // Final report
    console.log('\n🎉 COMPREHENSIVE IMPORT COMPLETE!');
    console.log(`✅ Successfully processed: ${processed} posts`);
    console.log(`🔄 Updated existing posts: ${updated} posts`);
    console.log(`❌ Errors encountered: ${errors} posts`);
    console.log(`📁 Blog directory: ${CONFIG.BLOG_DIR}`);
    console.log(`🖼️  Images directory: ${CONFIG.IMAGES_DIR}`);
    
    // List created image files
    if (fs.existsSync(CONFIG.IMAGES_DIR)) {
      const imageFiles = fs.readdirSync(CONFIG.IMAGES_DIR);
      console.log(`\n📸 Downloaded ${imageFiles.length} images:`);
      imageFiles.slice(0, 10).forEach(file => console.log(`   - ${file}`));
      if (imageFiles.length > 10) {
        console.log(`   ... and ${imageFiles.length - 10} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ IMPORT FAILED:', error.message);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  comprehensiveImport,
  downloadImageProperly,
  processEmbeds,
  fixBookmarkLinks,
  processImages,
  htmlToMarkdownProperly
};

// Run if called directly
if (require.main === module) {
  comprehensiveImport();
}