#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');

// Remove empty image references to external Substack CDN
function fixExternalImages(content) {
  // Remove empty image markdown with Substack CDN links
  content = content.replace(/\[\]\(https:\/\/substackcdn\.com\/image\/fetch\/[^)]+\)/g, '');
  
  // Remove empty image markdown with substack-post-media links
  content = content.replace(/\[\]\(https:\/\/[^)]*substack-post-media[^)]+\)/g, '');
  
  // Clean up any double newlines that might result
  content = content.replace(/\n{3,}/g, '\n\n');
  
  return content;
}

// Process all blog posts to fix external image references
function processExternalImages() {
  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));
  let fixedCount = 0;
  let totalFixed = 0;
  
  console.log(`Processing ${files.length} blog posts for external image fixes...`);
  
  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixExternalImages(originalContent);
    
    if (originalContent !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      fixedCount++;
      
      // Count how many external images were removed in this file
      const externalImages = (originalContent.match(/\[\]\(https:\/\/substackcdn\.com/g) || []).length;
      totalFixed += externalImages;
      
      console.log(`Fixed ${file}: removed ${externalImages} external image references`);
    }
  }
  
  console.log(`\nExternal Image Fix Summary:`);
  console.log(`- Fixed ${fixedCount} blog posts`);
  console.log(`- Total external image references removed: ${totalFixed}`);
  
  return { fixedCount, totalFixed };
}

// Run the script
if (require.main === module) {
  const results = processExternalImages();
  process.exit(0);
}

module.exports = {
  fixExternalImages,
  processExternalImages
};