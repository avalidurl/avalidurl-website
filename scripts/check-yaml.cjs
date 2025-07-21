const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const blogDir = path.join(__dirname, '../src/content/blog');

fs.readdirSync(blogDir)
  .filter(file => file.endsWith('.md'))
  .forEach(file => {
    try {
      const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        yaml.load(frontmatter);
      } else {
        console.log(`❌ No frontmatter found: ${file}`);
      }
    } catch (error) {
      console.log(`❌ YAML error in ${file}:`);
      console.log(error.message);
      console.log('');
    }
  });

console.log('✅ YAML check complete');