import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Category mapping - consolidate existing categories into 5 primary ones
const categoryMapping = {
  'finance': 'Finance & Markets',
  'defi': 'Finance & Markets', 
  'crypto': 'Crypto & Web3',
  'blockchain': 'Crypto & Web3',
  'art': 'Art & Culture',
  'writing': 'Art & Culture',
  'technology': 'Technology & Data',
  'data': 'Technology & Data',
  'general': 'General'
};

// Get blog directory
const blogDir = path.join(__dirname, '../src/content/blog');

// Read all blog files
const files = fs.readdirSync(blogDir).filter(file => 
  file.endsWith('.md') || file.endsWith('.mdx')
);

let updatedCount = 0;

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return;
  
  const frontmatter = frontmatterMatch[1];
  const categoryMatch = frontmatter.match(/^category:\s*["']?([^"'\n]+)["']?$/m);
  
  if (categoryMatch) {
    const oldCategory = categoryMatch[1];
    const newCategory = categoryMapping[oldCategory];
    
    if (newCategory && newCategory !== oldCategory) {
      content = content.replace(
        new RegExp(`^category:\\s*["']?${oldCategory}["']?$`, 'm'),
        `category: "${newCategory}"`
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}: ${oldCategory} → ${newCategory}`);
      updatedCount++;
    }
  }
});

console.log(`\nUpdated ${updatedCount} files with new categories`);
console.log('\nNew category structure:');
Object.values(categoryMapping).forEach(cat => 
  console.log(`- ${cat}`)
);