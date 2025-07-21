#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Markdown Fixer
 * Fixes all the broken markdown elements that were missed in the import
 */

const CONFIG = {
  BLOG_DIR: path.join(__dirname, '../src/content/blog'),
};

/**
 * Fix malformed YouTube embeds inside links
 */
function fixMalformedEmbeds(content) {
  let fixed = content;
  
  // Fix: [text](<YouTubeEmbed id="xyz" /> more text)
  fixed = fixed.replace(
    /\[([^\]]*)\]\(<(YouTubeEmbed|TwitterEmbed|SpotifyEmbed|AppleMusicEmbed|VimeoEmbed|SoundCloudEmbed)[^>]*>\s*([^)]*)\)/g,
    (match, linkText, embedType, embedProps, afterEmbed) => {
      // Extract the embed component properly
      const embedMatch = match.match(/<(YouTubeEmbed|TwitterEmbed|SpotifyEmbed|AppleMusicEmbed|VimeoEmbed|SoundCloudEmbed)([^>]*)>/);
      if (embedMatch) {
        const [, componentName, props] = embedMatch;
        const embed = `<${componentName}${props} />`;
        
        // If there's text after the embed, treat it as separate content
        if (afterEmbed && afterEmbed.trim && afterEmbed.trim()) {
          return `${embed}\n\n${linkText} ${afterEmbed.trim()}`;
        } else {
          return embed;
        }
      }
      return match;
    }
  );
  
  // Fix standalone malformed embeds
  fixed = fixed.replace(
    /<(YouTubeEmbed|TwitterEmbed|SpotifyEmbed|AppleMusicEmbed|VimeoEmbed|SoundCloudEmbed)([^>]*)\s+([^>]+)>/g,
    '<$1$2 />'
  );
  
  return fixed;
}

/**
 * Fix massive malformed Substack newsletter embeds
 */
function fixSubstackEmbeds(content) {
  let fixed = content;
  
  // Fix giant malformed links like: [TitleDescriptionRead more...author](url)
  fixed = fixed.replace(
    /\[([^[\]]*(?:Read more|likes|comments|ago)[^[\]]*)\]\(([^)]+)\)/g,
    (match, linkText, url) => {
      // If the link text is very long (likely a malformed embed), convert to proper format
      if (linkText.length > 200) {
        // Try to extract meaningful parts
        const titleMatch = linkText.match(/^([^.!?]*[.!?])/);
        const title = titleMatch ? titleMatch[1].trim() : linkText.substring(0, 100) + '...';
        
        return `**[${title}](${url})**\n\n*Click to read the full article*`;
      }
      return match;
    }
  );
  
  // Fix embedded article previews that are malformed
  fixed = fixed.replace(
    /\[([^[\]]{100,})\]\(([^)]+substack\.com[^)]*)\)/g,
    (match, longText, url) => {
      // Extract the title (usually the first sentence or phrase)
      const titleMatch = longText.match(/^([^.!?\n]{1,100}[.!?]?)/);
      const title = titleMatch ? titleMatch[1].trim() : longText.substring(0, 80) + '...';
      
      return `**[${title}](${url})**\n\n*Newsletter post - click to read more*`;
    }
  );
  
  return fixed;
}

/**
 * Fix merged URLs in excerpts and content
 */
function fixMergedUrls(content) {
  let fixed = content;
  
  // Fix excerpts with merged URLs like "texthttps://url"
  fixed = fixed.replace(
    /excerpt: "([^"]*)(https?:\/\/[^"\s]+)([^"]*)"/g,
    (match, beforeUrl, url, afterUrl) => {
      // Clean up the excerpt, removing the URL
      const cleanExcerpt = (beforeUrl + afterUrl).trim().replace(/\s+/g, ' ');
      return `excerpt: "${cleanExcerpt}"`;
    }
  );
  
  // Fix content with merged URLs like "texthttps://url"
  fixed = fixed.replace(
    /(\w)(https?:\/\/[^\s,)]+)/g,
    '$1 $2'
  );
  
  // Fix merged protocol URLs like "texthttps://url more text"
  fixed = fixed.replace(
    /([a-zA-Z])https?:\/\//g,
    '$1 https://'
  );
  
  return fixed;
}

/**
 * Fix general markdown formatting issues
 */
function fixGeneralMarkdown(content) {
  let fixed = content;
  
  // Fix double spaces around links
  fixed = fixed.replace(/\s+\[([^\]]+)\]\s+\(([^)]+)\)\s+/g, ' [$1]($2) ');
  
  // Fix broken line breaks around links
  fixed = fixed.replace(/([.!?])\[([^\]]+)\]/g, '$1 [$2]');
  
  // Fix missing spaces after periods
  fixed = fixed.replace(/([.!?])([A-Z])/g, '$1 $2');
  
  // Clean up multiple consecutive spaces
  fixed = fixed.replace(/  +/g, ' ');
  
  // Clean up broken paragraph spacing
  fixed = fixed.replace(/\n{3,}/g, '\n\n');
  
  // Fix subscription links that are just "Subscribe now"
  fixed = fixed.replace(
    /^\[Subscribe now\]\([^)]+\)\s*$/gm,
    ''
  );
  
  return fixed;
}

/**
 * Fix specific Substack artifacts
 */
function fixSubstackArtifacts(content) {
  let fixed = content;
  
  // Remove standalone "Subscribe now" lines
  fixed = fixed.replace(/^Subscribe now$/gm, '');
  
  // Remove empty subscription blocks
  fixed = fixed.replace(/^\[Subscribe now\]\([^)]+\)\s*$/gm, '');
  
  // Clean up "coming soon" posts
  if (fixed.includes('"coming soon."')) {
    const lines = fixed.split('\n');
    const contentLines = lines.filter(line => 
      !line.includes('Subscribe now') && 
      line.trim() !== '' || 
      line.startsWith('---')
    );
    fixed = contentLines.join('\n');
  }
  
  return fixed;
}

/**
 * Process a single blog post file
 */
async function processPost(filePath) {
  try {
    console.log(`🔧 Processing: ${path.basename(filePath)}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    
    // Apply all fixes
    content = fixMalformedEmbeds(content);
    content = fixSubstackEmbeds(content);
    content = fixMergedUrls(content);
    content = fixGeneralMarkdown(content);
    content = fixSubstackArtifacts(content);
    
    // Only write if content changed
    if (content.length !== originalLength || content !== fs.readFileSync(filePath, 'utf8')) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`   ✅ Fixed markdown issues`);
      return true;
    } else {
      console.log(`   ⏭️  No issues found`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Error processing ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

/**
 * Main function to fix all markdown files
 */
async function fixAllMarkdown() {
  console.log('🚀 Starting Comprehensive Markdown Fix...\n');
  
  if (!fs.existsSync(CONFIG.BLOG_DIR)) {
    throw new Error(`Blog directory not found: ${CONFIG.BLOG_DIR}`);
  }
  
  const files = fs.readdirSync(CONFIG.BLOG_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(CONFIG.BLOG_DIR, file));
  
  console.log(`📁 Found ${files.length} blog posts to check\n`);
  
  let processed = 0;
  let fixed = 0;
  let errors = 0;
  
  for (const file of files) {
    processed++;
    const wasFixed = await processPost(file);
    if (wasFixed) fixed++;
    
    // Small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('\n🎉 MARKDOWN FIXING COMPLETE!');
  console.log(`✅ Processed: ${processed} files`);
  console.log(`🔧 Fixed: ${fixed} files`);
  console.log(`❌ Errors: ${errors} files`);
  
  if (fixed > 0) {
    console.log('\n📋 Fixed Issues:');
    console.log('   - Malformed YouTube/embed components in links');
    console.log('   - Giant Substack newsletter embed links');
    console.log('   - Merged URLs in content and excerpts');
    console.log('   - General markdown formatting problems');
    console.log('   - Substack subscription artifacts');
  }
}

// Run if called directly
if (require.main === module) {
  fixAllMarkdown().catch(error => {
    console.error('❌ MARKDOWN FIX FAILED:', error.message);
    process.exit(1);
  });
}

module.exports = {
  fixAllMarkdown,
  fixMalformedEmbeds,
  fixSubstackEmbeds,
  fixMergedUrls,
  fixGeneralMarkdown,
  fixSubstackArtifacts
};