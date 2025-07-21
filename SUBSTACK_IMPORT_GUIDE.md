# 📥 Substack Import Guide

A comprehensive guide to importing your Substack publication content into this Astro-based blog system.

## 🎯 Overview

This project includes a powerful, battle-tested Substack import system that can migrate your entire publication while preserving formatting, images, and metadata. The system handles:

- **Complete Content Migration**: Posts, images, metadata, and structure
- **Image Processing**: Downloads and optimizes all images locally
- **Embed Conversion**: Converts Substack embeds to proper Astro components
- **SEO Preservation**: Maintains original URLs and meta information
- **Smart Formatting**: HTML to Markdown conversion with proper frontmatter

## 🚀 Quick Start

### 1. Export Your Substack Content

1. Go to your Substack publication settings
2. Navigate to **Settings** → **Export**
3. Click **"Export your publication"**
4. Wait for the email with your export file
5. Download and extract the ZIP file

### 2. Prepare the Import

```bash
# Place your Substack export in the scripts directory
cd scripts/
unzip your-publication-export.zip
```

Your export should contain:
- `posts.csv` - Post metadata
- `posts/` directory - HTML files for each post

### 3. Run the Import

```bash
# Import all posts
npm run import-substack

# Or run the comprehensive importer directly
node scripts/comprehensive-substack-importer.cjs
```

## 📋 What Gets Imported

### Post Content
- ✅ Title and subtitle
- ✅ Content body (HTML → Markdown)
- ✅ Publication date
- ✅ Tags and categories (auto-generated)
- ✅ Reading time estimation
- ✅ SEO metadata

### Media Processing
- ✅ Images downloaded and stored locally
- ✅ YouTube embeds → `<YouTubeEmbed>` components
- ✅ Twitter embeds → `<TwitterEmbed>` components
- ✅ Spotify embeds → `<SpotifyEmbed>` components
- ✅ Apple Music embeds → `<AppleMusicEmbed>` components
- ✅ Vimeo embeds → `<VimeoEmbed>` components
- ✅ SoundCloud embeds → `<SoundCloudEmbed>` components

### Content Cleanup
- ✅ Removes Substack subscription widgets
- ✅ Cleans tracking parameters from URLs
- ✅ Fixes broken bookmark formatting
- ✅ Converts HTML entities properly
- ✅ Standardizes link formatting

## 🛠 Advanced Usage

### Configuration Options

The importer can be configured by editing `scripts/comprehensive-substack-importer.cjs`:

```javascript
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
```

### Custom Tag Generation

The system automatically generates tags based on content analysis. You can customize the tag generation logic in the `generateTags()` function:

```javascript
function generateTags(content) {
  const tags = new Set();
  const text = content.toLowerCase();
  
  // Add your custom tag rules here
  if (/\b(your-keyword|another-term)\b/.test(text)) tags.add('custom-tag');
  
  return Array.from(tags);
}
```

### Filtering Posts

By default, the importer filters out:
- Unpublished posts
- Posts with empty titles
- "Join my subscriber chat" posts
- "Coming soon" posts

Customize the filter in the main import function:

```javascript
const publishedPosts = posts.filter(post => 
  post.is_published === 'true' && 
  post.title && 
  post.title.trim() !== '' &&
  // Add your custom filters here
  !post.title.toLowerCase().includes('your-filter')
);
```

## 🎨 Embed Components

The imported posts use these Astro components for rich media:

### YouTube Videos
```astro
<YouTubeEmbed id="dQw4w9WgXcQ" />
```

### Twitter/X Posts
```astro
<TwitterEmbed id="1234567890123456789" />
```

### Spotify Content
```astro
<SpotifyEmbed type="track" id="4iV5W9uYEdYUVa79Axb7Rh" />
<SpotifyEmbed type="album" id="1DFixLWuPkv3KT3TnV35m3" />
<SpotifyEmbed type="playlist" id="37i9dQZF1DX0XUsuxWHRQd" />
```

### Apple Music
```astro
<AppleMusicEmbed type="album" id="1234567890" />
<AppleMusicEmbed type="song" id="1234567890" />
```

### Vimeo Videos
```astro
<VimeoEmbed id="123456789" />
```

### SoundCloud
```astro
<SoundCloudEmbed user="username" track="track-name" />
```

## 📁 Output Structure

After import, your content will be organized as:

```
src/content/blog/
├── post-title-1.md
├── post-title-2.md
└── ...

public/blog/images/
├── post-title-1-1234567890.jpg
├── post-title-2-1234567891.png
└── ...
```

Each post file includes comprehensive frontmatter:

```yaml
---
title: "Your Post Title"
description: "Auto-generated description"
publishDate: 2024-01-01
author: "Your Name"
tags: ["tag1", "tag2", "tag3"]
category: "main-category"
featured: false
readingTime: 5
excerpt: "Auto-generated excerpt..."
originalUrl: "https://yourpublication.substack.com/p/post-slug"
---
```

## 🔧 Troubleshooting

### Common Issues

**1. Images Not Downloading**
- Check internet connection
- Verify image URLs are accessible
- Increase retry settings in CONFIG

**2. HTML Not Converting Properly**
- Check for malformed HTML in original posts
- Review the `htmlToMarkdownProperly()` function
- Some complex HTML might need manual cleanup

**3. Missing Posts**
- Verify CSV format is correct
- Check if posts are marked as published
- Review the filter criteria

**4. Embed Conversion Issues**
- Check URL patterns in `processEmbeds()` function
- Some embed formats might need custom handling
- Test with individual posts first

### Debug Mode

Enable verbose logging by modifying the console.log statements in the importer:

```javascript
// Uncomment these for debugging
// console.log('Processing post:', post);
// console.log('Generated markdown:', markdown.substring(0, 200));
```

### Manual Fixes

For posts that don't import correctly:

1. Check the original HTML file in `posts/` directory
2. Manually create the Markdown file in `src/content/blog/`
3. Use the frontmatter template from successfully imported posts

## 🚀 Performance Tips

### Large Publications

For publications with 100+ posts:

1. **Increase delays** to avoid rate limiting:
   ```javascript
   IMAGE_DOWNLOAD_DELAY: 2000,
   POST_PROCESS_DELAY: 1000,
   ```

2. **Process in batches**:
   ```javascript
   // Modify the main loop to process chunks
   const chunks = publishedPosts.slice(0, 50); // Process first 50
   ```

3. **Monitor system resources** during import

### Image Optimization

- Images are downloaded at full resolution
- Consider using Astro's image optimization for web delivery
- Large images might increase build times

## 📊 Import Statistics

The importer provides detailed statistics:

```bash
🎉 COMPREHENSIVE IMPORT COMPLETE!
✅ Successfully processed: 95 posts
🔄 Updated existing posts: 12 posts
❌ Errors encountered: 3 posts
📁 Blog directory: /src/content/blog
🖼️  Images directory: /public/blog/images

📸 Downloaded 127 images:
   - post-title-1-1234567890.jpg
   - post-title-2-1234567891.png
   ... and 125 more
```

## 🔄 Re-running Imports

The importer is idempotent - you can safely re-run it to:
- Update existing posts
- Import new posts
- Re-download failed images

Existing files will be overwritten with updated content.

## 🤝 Contributing

Found an issue or want to improve the importer? Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Test with your own Substack export
4. Submit a pull request

## 📚 Related Documentation

- [Main README](README.md) - Project overview and setup
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [Astro Documentation](https://docs.astro.build/) - Framework reference

---

**Need help?** Open an issue with:
- Your Substack export structure
- Error messages
- Example of problematic content