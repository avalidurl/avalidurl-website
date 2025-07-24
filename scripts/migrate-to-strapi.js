#!/usr/bin/env node

/**
 * Migration script to import existing markdown blog posts into Strapi
 * This script reads all markdown files from astro-site/src/content/blog/
 * and creates corresponding entries in Strapi via the API
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
let STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
// Remove trailing slash if present
STRAPI_URL = STRAPI_URL.replace(/\/$/, '');
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const BLOG_CONTENT_DIR = path.join(__dirname, '../astro-site/src/content/blog');

if (!STRAPI_TOKEN) {
  console.error('❌ STRAPI_API_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize Strapi API client
const strapiApi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
  }
});

/**
 * Convert markdown content to rich text format for Strapi
 */
function convertMarkdownToRichText(content) {
  // For now, we'll store as markdown in rich text
  // Strapi's rich text editor can handle markdown input
  return content;
}

/**
 * Extract reading time from frontmatter or estimate from content
 */
function getReadingTime(frontmatter, content) {
  if (frontmatter.readingTime) {
    return frontmatter.readingTime;
  }
  
  // Estimate reading time: ~200 words per minute
  const wordCount = content.split(/\\s+/).length;
  return Math.ceil(wordCount / 200);
}

/**
 * Create a slug from filename if not provided in frontmatter
 */
function createSlug(filename, frontmatter) {
  if (frontmatter.slug) {
    return frontmatter.slug;
  }
  
  // Remove extension and convert to slug
  return filename
    .replace(/\\.(md|mdx)$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Import a single markdown file to Strapi
 */
async function importMarkdownFile(filename) {
  const filepath = path.join(BLOG_CONTENT_DIR, filename);
  
  try {
    console.log(`📄 Processing: ${filename}`);
    
    // Read and parse the markdown file
    const fileContent = fs.readFileSync(filepath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);
    
    // Prepare the blog post data for Strapi
    const blogPostData = {
      title: frontmatter.title || 'Untitled',
      slug: createSlug(filename, frontmatter),
      content: convertMarkdownToRichText(content),
      excerpt: frontmatter.excerpt || frontmatter.description || '',
      author: frontmatter.author || 'Gokhan Turhan',
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      publishedAt: frontmatter.publishDate || frontmatter.publishedAt || new Date().toISOString(),
      featured: frontmatter.featured || false,
      readingTime: getReadingTime(frontmatter, content)
    };
    
    // Check if post already exists by slug
    const existingPosts = await strapiApi.get('/blog-posts', {
      params: {
        filters: { slug: { $eq: blogPostData.slug } }
      }
    });
    
    if (existingPosts.data.data.length > 0) {
      console.log(`⚠️  Skipping ${filename} - post with slug "${blogPostData.slug}" already exists`);
      return { status: 'skipped', filename, slug: blogPostData.slug };
    }
    
    // Create the blog post in Strapi
    const response = await strapiApi.post('/blog-posts', {
      data: blogPostData
    });
    
    console.log(`✅ Imported: ${filename} → ${blogPostData.slug}`);
    return { 
      status: 'imported', 
      filename, 
      slug: blogPostData.slug, 
      id: response.data.data.id 
    };
    
  } catch (error) {
    console.error(`❌ Error importing ${filename}:`, error.response?.data || error.message);
    return { status: 'error', filename, error: error.message };
  }
}

/**
 * Main migration function
 */
async function migrateToStrapi() {
  console.log('🚀 Starting migration from Markdown to Strapi...');
  console.log(`📂 Source directory: ${BLOG_CONTENT_DIR}`);
  console.log(`🌐 Strapi URL: ${STRAPI_URL}`);
  console.log('');
  
  try {
    // Test Strapi connection and check available content types
    console.log('🔍 Testing Strapi connection...');
    
    try {
      // First try to get blog-posts
      await strapiApi.get('/blog-posts?pagination[limit]=1');
      console.log('✅ Strapi connection successful - blog-posts endpoint found');
    } catch (error) {
      console.log('⚠️  blog-posts endpoint not found, checking available endpoints...');
      
      // Try to get content types info
      try {
        const response = await strapiApi.get('/content-type-builder/content-types');
        console.log('📋 Available content types:', Object.keys(response.data.data || {}));
      } catch (e) {
        // Try a basic health check
        const healthCheck = await strapiApi.get('/');
        console.log('🏥 Basic Strapi health check passed');
      }
      
      throw error;
    }
    console.log('');
    
    // Get all markdown files
    const files = fs.readdirSync(BLOG_CONTENT_DIR)
      .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
      .sort();
    
    if (files.length === 0) {
      console.log('❌ No markdown files found in the blog content directory');
      return;
    }
    
    console.log(`📚 Found ${files.length} markdown files to migrate`);
    console.log('');
    
    // Process each file
    const results = [];
    for (const file of files) {
      const result = await importMarkdownFile(file);
      results.push(result);
      
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('');
    console.log('📊 Migration Summary:');
    const imported = results.filter(r => r.status === 'imported');
    const skipped = results.filter(r => r.status === 'skipped');
    const errors = results.filter(r => r.status === 'error');
    
    console.log(`✅ Imported: ${imported.length}`);
    console.log(`⚠️  Skipped: ${skipped.length}`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('');
      console.log('❌ Files with errors:');
      errors.forEach(error => {
        console.log(`   - ${error.filename}: ${error.error}`);
      });
    }
    
    console.log('');
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the migration
migrateToStrapi().catch(console.error);