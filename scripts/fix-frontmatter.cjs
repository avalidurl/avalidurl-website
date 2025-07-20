#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Fix frontmatter in all blog posts to match updated schema
 */

const BLOG_DIR = path.join(__dirname, '../src/content/blog');

/**
 * Process a single blog post file
 */
function fixBlogPost(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Split frontmatter and content
    const parts = content.split('---');
    if (parts.length < 3) {
      console.log(`  Skipping: No valid frontmatter found`);
      return false;
    }
    
    const frontmatter = parts[1];
    const markdownContent = parts.slice(2).join('---');
    
    // Fix frontmatter
    let fixedFrontmatter = frontmatter;
    
    // Fix publishDate - add quotes if not quoted
    fixedFrontmatter = fixedFrontmatter.replace(
      /publishDate:\s*(\d{4}-\d{2}-\d{2})(?!\w)/g,
      'publishDate: "$1"'
    );
    
    // Fix updatedDate - add quotes if not quoted
    fixedFrontmatter = fixedFrontmatter.replace(
      /updatedDate:\s*(\d{4}-\d{2}-\d{2})(?!\w)/g,
      'updatedDate: "$1"'
    );
    
    // Ensure author is set
    if (!fixedFrontmatter.includes('author:')) {
      fixedFrontmatter += '\nauthor: "Gokhan Turhan"';
    }
    
    // Write back the fixed content
    const fixedContent = `---${fixedFrontmatter}---${markdownContent}`;
    fs.writeFileSync(filepath, fixedContent, 'utf8');
    
    return true;
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
function fixAllBlogPosts() {
  try {
    console.log('Starting frontmatter fixes...');
    
    // Get all markdown files
    const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));
    console.log(`Found ${files.length} blog posts to process`);
    
    let fixed = 0;
    let skipped = 0;
    
    for (const file of files) {
      const filepath = path.join(BLOG_DIR, file);
      console.log(`\nProcessing: ${file}`);
      
      if (fixBlogPost(filepath)) {
        console.log(`  ✅ Fixed`);
        fixed++;
      } else {
        console.log(`  ⏭️  Skipped`);
        skipped++;
      }
    }
    
    console.log(`\n🎉 Frontmatter fix complete!`);
    console.log(`✅ Fixed: ${fixed} posts`);
    console.log(`⏭️  Skipped: ${skipped} posts`);
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

// Run the fix
fixAllBlogPosts();