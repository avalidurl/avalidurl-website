const fs = require('fs');
const csv = require('csv-parser');

async function testSinglePost() {
  console.log('🔍 Testing single post parsing...');
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('/tmp/headers.csv')
      .pipe(csv())
      .on('data', (row) => {
        console.log('Found row:');
        console.log('Title:', row.title);
        console.log('Slug:', row.slug);
        console.log('Published:', row.published);
        console.log('Content length:', row.staticHtml ? row.staticHtml.length : 'NO CONTENT');
        console.log('First 200 chars:', row.staticHtml ? row.staticHtml.substring(0, 200) : 'NO CONTENT');
      })
      .on('end', resolve)
      .on('error', reject);
  });
}

if (require.main === module) {
  testSinglePost().catch(console.error);
} 