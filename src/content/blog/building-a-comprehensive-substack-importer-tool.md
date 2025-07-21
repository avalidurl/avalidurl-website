---
title: "Building a Comprehensive Substack Importer Tool"
description: "How I built a robust tool to import 100+ blog posts from Substack export data, handling HTML-to-Markdown conversion, image processing, and metadata extraction with Node.js."
publishDate: 2025-07-21
author: "Gokhan Turhan"
tags: ["technology", "tools", "automation", "web-development"]
category: "technology"
featured: true
readingTime: 8
excerpt: "Creating a production-ready tool to migrate an entire blog from Substack to Astro, complete with image downloads, metadata preservation, and intelligent content processing."
---

When faced with the task of migrating over 100 blog posts from Substack to an Astro-based website, I realized that manual copy-pasting wasn't going to cut it. What started as a simple data migration challenge turned into building a comprehensive importer tool that handles everything from HTML parsing to image asset management.

## The Challenge

Substack provides export functionality, but the exported data comes in a specific format that requires significant processing:

- **CSV metadata** with post information, publish dates, and engagement data
- **Individual HTML files** for each post with Substack-specific markup
- **Embedded images** hosted on Substack's CDN that need to be downloaded locally
- **Mixed content types** including newsletters, drafts, and published posts

The goal was to create a tool that could automatically process this export and generate properly formatted Markdown files with correct frontmatter for an Astro content collection.

## Architecture Overview

The importer consists of several key components:

```javascript
const EXPORT_DIR = path.join(__dirname, '.');
const POSTS_CSV = path.join(EXPORT_DIR, 'posts.csv');
const POSTS_HTML_DIR = path.join(EXPORT_DIR, 'posts');
const BLOG_DIR = path.join(__dirname, '../src/content/blog');
```

The tool processes three main data sources:
1. **posts.csv** - Contains metadata for all posts
2. **posts/** directory - Individual HTML files for each post
3. **Local file system** - Where the final Markdown files are generated

## CSV Parsing and Filtering

The first challenge was parsing Substack's CSV format, which includes various post types and states:

```javascript
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  const posts = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const post = {};
      headers.forEach((header, index) => {
        post[header] = values[index];
      });
      posts.push(post);
    }
  }

  return posts.filter(post => 
    post.is_published === 'true' && 
    post.title && 
    post.title.trim() !== ''
  );
}
```

The filtering logic ensures we only process published posts with valid titles, avoiding drafts and empty entries that Substack includes in exports.

## HTML to Markdown Conversion

Converting Substack's HTML to clean Markdown required handling various edge cases:

```javascript
function htmlToMarkdown(html) {
  let markdown = html;
  
  // Convert headers with proper spacing
  markdown = markdown.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, content) => {
    const hashes = '#'.repeat(parseInt(level));
    return `\n${hashes} ${content.trim()}\n`;
  });
  
  // Handle paragraphs and preserve line breaks
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');
  
  // Convert links while preserving structure
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Process lists with proper formatting
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (!items) return match;
    return '\n' + items.map(item => 
      '- ' + item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').trim()
    ).join('\n') + '\n';
  });
  
  // Clean up HTML entities
  markdown = markdown.replace(/&nbsp;/g, ' ');
  markdown = markdown.replace(/&amp;/g, '&');
  markdown = markdown.replace(/&#8217;/g, "'");
  markdown = markdown.replace(/&#8220;/g, '"');
  markdown = markdown.replace(/&#8221;/g, '"');
  
  return markdown.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
}
```

This conversion handles the most common HTML elements while preserving the semantic structure of the content.

## Image Asset Management

One of the most complex aspects was downloading and rehosting images:

```javascript
async function downloadImage(imageUrl, filename) {
  try {
    const imageData = await fetchContent(imageUrl);
    const imagePath = path.join(IMAGES_DIR, filename);
    fs.writeFileSync(imagePath, imageData, 'binary');
    return `/blog/images/${filename}`;
  } catch (error) {
    console.log(`Failed to download image: ${imageUrl}`);
    return imageUrl; // Fallback to original URL
  }
}

// Process images in markdown content
const imageMatches = markdownContent.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
for (const imageMatch of imageMatches) {
  const urlMatch = imageMatch.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  if (urlMatch && urlMatch[2].startsWith('http')) {
    const imageUrl = urlMatch[2];
    const imageExtension = path.extname(imageUrl).split('?')[0] || '.jpg';
    const imageName = `${slug}-${Date.now()}${imageExtension}`;
    
    const localImagePath = await downloadImage(imageUrl, imageName);
    markdownContent = markdownContent.replace(imageUrl, localImagePath);
  }
}
```

This ensures all images are downloaded locally and references are updated to use the local paths, making the content completely self-contained.

## Frontmatter Generation

Creating proper frontmatter for Astro required intelligent tag generation and metadata extraction:

```javascript
function generateFrontmatter(post, content, publishDate) {
  const excerpt = extractExcerpt(content);
  const readingTime = estimateReadingTime(content);
  
  // Intelligent tag generation based on content
  let tags = [];
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('finance') || contentLower.includes('market') || contentLower.includes('defi')) {
    tags.push('finance');
  }
  if (contentLower.includes('crypto') || contentLower.includes('blockchain') || contentLower.includes('bitcoin')) {
    tags.push('crypto');
  }
  if (contentLower.includes('technology') || contentLower.includes('ai') || contentLower.includes('algorithm')) {
    tags.push('technology');
  }
  if (contentLower.includes('art') || contentLower.includes('design') || contentLower.includes('creative')) {
    tags.push('art');
  }
  
  if (tags.length === 0) tags.push('general');
  
  return `---
title: "${post.title.replace(/"/g, '\\"')}"
description: "${excerpt.replace(/"/g, '\\"')}"
publishDate: ${publishDate}
author: "Gokhan Turhan"
tags: [${tags.map(tag => `"${tag}"`).join(', ')}]
category: "${tags[0]}"
featured: false
readingTime: ${readingTime}
excerpt: "${excerpt.replace(/"/g, '\\"')}"
originalUrl: "${post.originalUrl || ''}"
---`;
}
```

The tag generation uses content analysis to automatically categorize posts, while preserving essential metadata from the original Substack posts.

## Error Handling and Resilience

The tool includes comprehensive error handling to deal with malformed data:

```javascript
try {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  const markdownContent = htmlToMarkdown(htmlContent);
  
  if (!markdownContent || markdownContent.trim().length < 50) {
    console.log(`Skipping: Content too short for ${post.title}`);
    continue;
  }
  
  const frontmatter = generateFrontmatter(post, markdownContent, formattedDate);
  const finalContent = `${frontmatter}\n\n${markdownContent}`;
  
  fs.writeFileSync(outputPath, finalContent, 'utf8');
  console.log(`✅ Created: ${filename}`);
  
} catch (error) {
  console.log(`❌ Error processing ${post.title}: ${error.message}`);
  continue; // Skip failed posts and continue processing
}
```

This ensures that a single malformed post doesn't break the entire import process.

## Performance Optimization

For large exports, the tool includes several optimizations:

```javascript
// Skip existing files to allow resumable imports
if (fs.existsSync(outputPath)) {
  console.log(`Skipping: ${filename} already exists`);
  continue;
}

// Rate limiting for image downloads
await new Promise(resolve => setTimeout(resolve, 1000));

// Batch processing with progress reporting
console.log(`Processing post ${i + 1}/${posts.length}: ${post.title}`);
```

These features make the tool practical for large datasets while providing clear feedback on progress.

## Usage and Results

The final tool successfully imported over 100 blog posts, processing:

- **✅ 107 published posts** with complete metadata
- **🖼️ 50+ images** downloaded and rehosted locally  
- **📝 Clean Markdown** with proper frontmatter for each post
- **🏷️ Intelligent tagging** based on content analysis
- **📅 Preserved publish dates** maintaining chronological order

Running the import is straightforward:

```bash
npm run import-from-export
```

The tool outputs detailed logs showing progress and any issues encountered, making it easy to identify and fix problems.

## Key Learnings

Building this tool taught me several important lessons about data migration:

1. **Always validate input data** - Export formats can contain inconsistencies
2. **Make operations resumable** - Large imports can fail partway through
3. **Preserve semantic structure** - Don't just convert markup, maintain meaning
4. **Plan for edge cases** - Real-world data is messier than you expect
5. **Provide detailed feedback** - Good logging makes debugging much easier

## Future Improvements

The tool could be enhanced with:

- **Support for other platforms** (Medium, Ghost, WordPress)
- **Advanced content analysis** for better tag generation
- **Image optimization** during download
- **Parallel processing** for faster imports
- **Configuration files** for different site structures

## Conclusion

What started as a simple migration task became an exercise in building robust data processing tools. The resulting importer successfully handled the complexity of real-world export data while maintaining content quality and preserving important metadata.

For anyone facing similar migration challenges, the key is to start simple and iteratively add robustness. Focus on handling the common cases first, then add error handling and edge case management as you encounter real-world data.

The tool now serves as a reliable way to migrate content from Substack to any Markdown-based static site generator, proving that with the right approach, even complex data migrations can be automated effectively.