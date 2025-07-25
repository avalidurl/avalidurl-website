const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../src/content/blog');

// Posts that should be converted to MDX (contain embeds, Twitter links, YouTube, etc.)
const POSTS_TO_CONVERT = [
  'this-week-in-writing-and-nfts-4.md',
  'playlist-4.md', 
  'book-of-concepts-1-rugpool.md',
  'the-transmission.md',
  'giga-radar-morning-edition.md',
  'intraview-w-joan—md.md',
  'playlist-1.md',
  'philosophy.md',
  'the-making-of-artinprod.md',
  'this-week-in-writing-and-nfts-5.md',
  'daily-markets-1.md',
  'on-writing-nfts-1.md',
  '1kb-dna-data-storage-consumer-kits-hits-the-market.md',
  'a-dangerous-self-sufficiency.md',
  'interview-with-w-m-peaster-—-part-i.md',
  'virulent-optimism-hating-smoking.md',
  'this-week-in-writing-and-nfts-2.md',
  'playlist-2.md',
  'this-week-in-writing-and-nfts-6.md',
  'chain-standard-1.md',
  'memenomics-daily-3.md',
  'lets-talk-curation-2-gokhan.md',
  'droplets-i.md',
  'playlist-3.md',
  'this-week-in-writing-and-nfts-3.md',
  'confessions-of-a-conceptual-artist-1.md'
];

function convertToMdx() {
  console.log('🔄 Converting Paragraph posts from .md to .mdx...\n');
  
  let converted = 0;
  let skipped = 0;
  
  for (const filename of POSTS_TO_CONVERT) {
    const mdPath = path.join(BLOG_DIR, filename);
    const mdxPath = path.join(BLOG_DIR, filename.replace('.md', '.mdx'));
    
    // Check if .md file exists
    if (!fs.existsSync(mdPath)) {
      console.log(`⚠️  Skipping ${filename} - file not found`);
      skipped++;
      continue;
    }
    
    // Check if .mdx already exists
    if (fs.existsSync(mdxPath)) {
      console.log(`⚠️  Skipping ${filename} - .mdx version already exists`);
      skipped++;
      continue;
    }
    
    try {
      // Read the .md file content
      const content = fs.readFileSync(mdPath, 'utf8');
      
      // Write to .mdx file
      fs.writeFileSync(mdxPath, content);
      
      // Delete the .md file
      fs.unlinkSync(mdPath);
      
      console.log(`✅ Converted ${filename} to .mdx`);
      converted++;
    } catch (error) {
      console.error(`❌ Error converting ${filename}:`, error.message);
    }
  }
  
  console.log(`\n📊 Conversion Summary:`);
  console.log(`   ✅ Converted: ${converted} files`);
  console.log(`   ⚠️  Skipped: ${skipped} files`);
  console.log(`   📝 Total processed: ${converted + skipped} files`);
}

// Run the conversion
convertToMdx(); 