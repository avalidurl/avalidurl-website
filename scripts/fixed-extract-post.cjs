const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../src/content/blog');

// Function to clean HTML content
function cleanHtmlContent(html) {
  if (!html) return '';
  
  let cleaned = html
    .replace(/<script[^>]*>.*?<\/script>/gsi, '')
    .replace(/<style[^>]*>.*?<\/style>/gsi, '')
    .replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, '![Image]($1)')
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gsi, '[$2]($1)')
    .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gsi, (match, level, text) => {
      const hashes = '#'.repeat(parseInt(level));
      return `\n${hashes} ${text.replace(/<[^>]+>/g, '').trim()}\n`;
    })
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
    
  return cleaned;
}

// Function to format date
function formatDate(timestamp) {
  if (!timestamp) return new Date().toISOString().split('T')[0];
  
  if (typeof timestamp === 'string' && timestamp.includes('-')) {
    return timestamp.split('T')[0];
  }
  
  const numericTimestamp = parseInt(timestamp);
  if (isNaN(numericTimestamp)) {
    return new Date().toISOString().split('T')[0];
  }
  
  const date = new Date(numericTimestamp);
  
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  
  return date.toISOString().split('T')[0];
}

async function extractTransdimensionalPost() {
  console.log('🔧 Extracting Transdimensional Bloc post with fixed method...');
  
  // Read the entire CSV as text
  const csvContent = fs.readFileSync('/Users/gokhanturhan/Downloads/posts.csv', 'utf-8');
  const lines = csvContent.split('\n');
  
  // Get line 2218 (0-indexed 2217)
  const targetLine = lines[2217];
  
  if (!targetLine) {
    console.log('❌ Could not find target line');
    return;
  }
  
  console.log(`Target line length: ${targetLine.length} characters`);
  
  // Extract key information using regex patterns instead of CSV parsing
  
  // Extract title (between "Arguing for the Transdimensional Bloc")
  const titleMatch = targetLine.match(/"Arguing for the Transdimensional Bloc"/);
  const title = titleMatch ? "Arguing for the Transdimensional Bloc" : "Unknown Title";
  
  // Extract description/preview
  const previewMatch = targetLine.match(/"This post is taking part in the Kiwi x Dappcon Writing Challenge\. It's a call for the formation of Transdimensional Bloc around crypto and AI futures\."/);
  const preview = previewMatch ? previewMatch[0].slice(1, -1) : "Imported from Paragraph";
  
  // Extract the HTML content (it starts with "<div class=\"relative header-and-anchor\">" and ends before the timestamp)
  const htmlStartPattern = '"<div class=""relative header-and-anchor"">';
  const htmlStartIndex = targetLine.indexOf(htmlStartPattern);
  
  if (htmlStartIndex === -1) {
    console.log('❌ Could not find HTML content start');
    return;
  }
  
  // Find the end of the HTML content (look for the closing pattern before the timestamp)
  const htmlEndPattern = '</code></p>"';
  const htmlEndIndex = targetLine.indexOf(htmlEndPattern, htmlStartIndex);
  
  if (htmlEndIndex === -1) {
    console.log('❌ Could not find HTML content end');
    return;
  }
  
  // Extract the HTML content
  const htmlContent = targetLine.substring(htmlStartIndex + 1, htmlEndIndex + htmlEndPattern.length - 1);
  
  console.log(`📄 Extracted HTML content length: ${htmlContent.length} characters`);
  
  if (htmlContent.length < 1000) {
    console.log('❌ HTML content too short');
    return;
  }
  
  // Extract timestamp (look for the long number after the HTML)
  const timestampMatch = targetLine.match(/(\d{13})/);
  const timestamp = timestampMatch ? timestampMatch[1] : null;
  
  // Extract arweave ID (look for the long string after the timestamp)
  const arweaveMatch = targetLine.match(/"([a-zA-Z0-9_-]{43})"/);
  const arweaveId = arweaveMatch ? arweaveMatch[1] : '';
  
  console.log('📊 Extracted data:');
  console.log('Title:', title);
  console.log('Preview:', preview.substring(0, 100) + '...');
  console.log('HTML length:', htmlContent.length);
  console.log('Timestamp:', timestamp);
  console.log('Arweave ID:', arweaveId);
  
  // Clean the HTML content
  const cleanContent = cleanHtmlContent(htmlContent);
  
  // Create the blog post
  const filename = 'arguing-for-the-transdimensional-bloc.md';
  const filepath = path.join(BLOG_DIR, filename);
  
  const frontmatter = `---
title: "${title}"
publishedAt: "${formatDate(timestamp)}"
description: "${preview}"
tags: ["paragraph","imported","transdimensional","ai","blockchain","acceleration","cthulhugpt"]
draft: false
arweave: "${arweaveId}"
source: "paragraph"
originalSlug: "transdimensional-bloc"
---

${cleanContent}`;
  
  // Delete any existing broken version
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    console.log('🗑️ Deleted existing broken version');
  }
  
  fs.writeFileSync(filepath, frontmatter);
  console.log(`✅ Successfully created: ${filename}`);
  console.log(`📊 Final content length: ${cleanContent.length} characters`);
  
  // Show first few lines to verify
  console.log('\n📝 First few lines of content:');
  console.log(cleanContent.substring(0, 300) + '...');
}

if (require.main === module) {
  extractTransdimensionalPost().catch(console.error);
} 