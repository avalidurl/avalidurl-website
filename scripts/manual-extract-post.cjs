const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../src/content/blog');

// Function to clean HTML content
function cleanHtmlContent(html) {
  if (!html) return '';
  
  let cleaned = html
    // Remove script and style tags completely
    .replace(/<script[^>]*>.*?<\/script>/gsi, '')
    .replace(/<style[^>]*>.*?<\/style>/gsi, '')
    
    // Convert images to markdown
    .replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, '![Image]($1)')
    
    // Convert links to markdown
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gsi, '[$2]($1)')
    
    // Convert headings to markdown
    .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gsi, (match, level, text) => {
      const hashes = '#'.repeat(parseInt(level));
      return `\n${hashes} ${text.replace(/<[^>]+>/g, '').trim()}\n`;
    })
    
    // Convert paragraphs
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    
    // Convert line breaks
    .replace(/<br[^>]*>/gi, '\n')
    
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    
    // Clean up whitespace
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    
    // Clean up excessive whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
    
  return cleaned;
}

// Function to create slug
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Function to format date
function formatDate(timestamp) {
  if (!timestamp) return new Date().toISOString().split('T')[0];
  
  let date;
  if (typeof timestamp === 'string' && timestamp.includes('-')) {
    return timestamp.split('T')[0];
  }
  
  const numericTimestamp = parseInt(timestamp);
  if (isNaN(numericTimestamp)) {
    return new Date().toISOString().split('T')[0];
  }
  
  date = new Date(numericTimestamp);
  
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  
  return date.toISOString().split('T')[0];
}

// Manual extraction function
async function extractSpecificPost() {
  console.log('🔧 Manually extracting Transdimensional Bloc post...');
  
  // Read the entire CSV as text first
  const csvContent = fs.readFileSync('/Users/gokhanturhan/Downloads/posts.csv', 'utf-8');
  const lines = csvContent.split('\n');
  
  console.log(`Total lines in CSV: ${lines.length}`);
  
  // Find the line that contains the full content (line 2218)
  const targetLine = lines[2217]; // 0-indexed, so line 2218 is index 2217
  
  if (!targetLine) {
    console.log('❌ Could not find the target line');
    return;
  }
  
  console.log(`Target line length: ${targetLine.length} characters`);
  
  // Manual parsing of the CSV line
  // The structure should be: ugc,archived,id,accessRestriction,authors,storeOnArweave,trending,sendXMTP,isImported,publishedAt,numTimesPublished,sendNewsletter,published,title,dontPublishOnline,createdAt,post_preview,subtitle,manualPublishedAt,json,categories,contributors,slug,staticHtml,updatedAt,arweaveId,isUnlisted,draftOf,blogId,userId,latestDraftId,isLatestDraft,parentId,cover_image_url,cover_img
  
  // Split on commas, but be careful about quoted content
  const parts = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < targetLine.length; i++) {
    const char = targetLine[i];
    
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
      current += char;
    } else if (char === quoteChar && inQuotes) {
      // Check if it's an escaped quote
      if (i + 1 < targetLine.length && targetLine[i + 1] === quoteChar) {
        current += char + char;
        i++; // Skip the next quote
      } else {
        inQuotes = false;
        current += char;
      }
    } else if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last part
  if (current) {
    parts.push(current);
  }
  
  console.log(`Parsed ${parts.length} CSV fields`);
  
  // Map to the expected fields
  const post = {
    title: parts[13] ? parts[13].replace(/^["']|["']$/g, '') : 'Unknown',
    slug: parts[22] ? parts[22].replace(/^["']|["']$/g, '') : '',
    staticHtml: parts[23] ? parts[23].replace(/^["']|["']$/g, '') : '',
    publishedAt: parts[9] ? parts[9].replace(/^["']|["']$/g, '') : '',
    post_preview: parts[16] ? parts[16].replace(/^["']|["']$/g, '') : '',
    arweaveId: parts[25] ? parts[25].replace(/^["']|["']$/g, '') : '',
    published: parts[12] ? parts[12].replace(/^["']|["']$/g, '') : ''
  };
  
  console.log('📄 Extracted post info:');
  console.log('Title:', post.title);
  console.log('Slug:', post.slug);
  console.log('Published:', post.published);
  console.log('Content length:', post.staticHtml.length);
  console.log('ArweaveId:', post.arweaveId);
  
  if (post.staticHtml.length < 100) {
    console.log('❌ Content too short, something went wrong');
    console.log('Raw content:', post.staticHtml);
    return;
  }
  
  // Create the blog post
  const cleanContent = cleanHtmlContent(post.staticHtml);
  const slug = post.slug === 'extropism' ? 'transdimensional-bloc' : post.slug;
  const filename = `${slug}.md`;
  const filepath = path.join(BLOG_DIR, filename);
  
  const frontmatter = `---
title: "${post.title}"
publishedAt: "${formatDate(post.publishedAt)}"
description: "${post.post_preview || 'Imported from Paragraph'}"
tags: ["paragraph","imported","transdimensional","ai","blockchain","acceleration"]
draft: false
arweave: "${post.arweaveId}"
source: "paragraph"
originalSlug: "${post.slug}"
---

${cleanContent}`;
  
  fs.writeFileSync(filepath, frontmatter);
  console.log(`✅ Successfully created: ${filename}`);
  console.log(`📊 Content length: ${cleanContent.length} characters`);
}

if (require.main === module) {
  extractSpecificPost().catch(console.error);
} 