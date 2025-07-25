const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../src/content/blog');

// Files with slugs longer than 100 characters and their shortened versions
const LONG_SLUGS = [
  {
    oldFile: 'the-poetics-of-a-dao-landscape-through-the-unimaginably-existent-7th-sense-of-a-petaloid-at-the-end-of-the-per-block-time-of-existence,-or-a-poem.md',
    newFile: 'poetics-of-dao-landscape-7th-sense-petaloid-per-block-time-poem.md'
  },
  {
    oldFile: 'sound-image-and-new-year-gifts-and-maybe-some-nonfungiblesalso-seo-plase-gm-and-perchance-an-nft-100k-eoy-lfg.md',
    newFile: 'sound-image-new-year-gifts-nonfungibles-seo-nft-100k-eoy.md'
  },
  {
    oldFile: 'the-case-against-zombie-nfts-or-how-i-started-to-discard-them-for-perpetual-convivialitiesthe-rise-proliferation-of-ipnfts-sbts-part-i.md',
    newFile: 'case-against-zombie-nfts-perpetual-convivialities-ipnfts-sbts-part-i.md'
  }
];

function shortenLongSlugs() {
  console.log('🔧 Shortening blog post slugs longer than 100 characters...');
  
  let renamed = 0;
  let failed = 0;
  
  LONG_SLUGS.forEach(({ oldFile, newFile }) => {
    const oldPath = path.join(BLOG_DIR, oldFile);
    const newPath = path.join(BLOG_DIR, newFile);
    
    console.log(`\n📝 Processing: ${oldFile}`);
    console.log(`   Old length: ${oldFile.replace('.md', '').length} chars`);
    console.log(`   New length: ${newFile.replace('.md', '').length} chars`);
    
    if (!fs.existsSync(oldPath)) {
      console.log(`   ⚠️  File not found: ${oldFile}`);
      failed++;
      return;
    }
    
    if (fs.existsSync(newPath)) {
      console.log(`   ⚠️  Target file already exists: ${newFile}`);
      failed++;
      return;
    }
    
    try {
      // Read the content
      const content = fs.readFileSync(oldPath, 'utf-8');
      
      // Update the originalSlug in frontmatter to preserve the original
      const updatedContent = content.replace(
        /originalSlug: "([^"]+)"/,
        `originalSlug: "${oldFile.replace('.md', '')}"`
      );
      
      // Write to new file
      fs.writeFileSync(newPath, updatedContent);
      
      // Remove old file
      fs.unlinkSync(oldPath);
      
      console.log(`   ✅ Renamed successfully`);
      renamed++;
      
    } catch (error) {
      console.log(`   ❌ Failed to rename: ${error.message}`);
      failed++;
    }
  });
  
  console.log(`\n🎉 Summary:`);
  console.log(`  ✅ Renamed: ${renamed} files`);
  console.log(`  ❌ Failed: ${failed} files`);
  console.log(`  📊 Total processed: ${LONG_SLUGS.length} files`);
  
  if (renamed > 0) {
    console.log(`\n📋 Renamed files:`);
    LONG_SLUGS.forEach(({ oldFile, newFile }) => {
      const newPath = path.join(BLOG_DIR, newFile);
      if (fs.existsSync(newPath)) {
        console.log(`  - ${newFile} (${newFile.replace('.md', '').length} chars)`);
      }
    });
  }
}

if (require.main === module) {
  shortenLongSlugs();
} 