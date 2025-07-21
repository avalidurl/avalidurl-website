#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');

// Fix YouTube embeds from id prop to url prop
function fixYouTubeEmbeds(content) {
  // Convert <YouTubeEmbed id="VIDEO_ID" /> to <YouTubeEmbed url="https://youtube.com/watch?v=VIDEO_ID" />
  content = content.replace(
    /<YouTubeEmbed\s+id="([a-zA-Z0-9_-]+)"\s*\/?\s*>/g,
    '<YouTubeEmbed url="https://youtube.com/watch?v=$1" />'
  );
  
  // Also handle any that might have extra spaces or different formatting
  content = content.replace(
    /<YouTubeEmbed\s+id=["']([a-zA-Z0-9_-]+)["']\s*\/?\s*>/g,
    '<YouTubeEmbed url="https://youtube.com/watch?v=$1" />'
  );
  
  return content;
}

// Process all blog posts to fix YouTube embeds
function processYouTubeEmbeds() {
  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));
  let fixedCount = 0;
  let totalFixed = 0;
  
  console.log(`Processing ${files.length} blog posts for YouTube embed fixes...`);
  
  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixYouTubeEmbeds(originalContent);
    
    if (originalContent !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      fixedCount++;
      
      // Count how many YouTube embeds were fixed in this file
      const embeds = (originalContent.match(/<YouTubeEmbed\s+id="/g) || []).length;
      totalFixed += embeds;
      
      console.log(`Fixed ${file}: ${embeds} YouTube embeds`);
    }
  }
  
  console.log(`\nYouTube Embed Fix Summary:`);
  console.log(`- Fixed ${fixedCount} blog posts`);
  console.log(`- Total YouTube embeds fixed: ${totalFixed}`);
  
  return { fixedCount, totalFixed };
}

// Run the script
if (require.main === module) {
  const results = processYouTubeEmbeds();
  process.exit(0);
}

module.exports = {
  fixYouTubeEmbeds,
  processYouTubeEmbeds
};