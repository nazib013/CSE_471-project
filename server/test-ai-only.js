// Direct test without starting full server
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const { aiCategorize } = require('./utils/categorizer');

async function test() {
  console.log('\n📝 Testing AI Categorizer with gemma-3-1b-it...\n');
  
  const testCases = [
    { title: 'cat litter', description: 'fresh 5 kg' },
    { title: 'first aid kit', description: '12 new packs' },
  ];
  
  for (const tc of testCases) {
    try {
      const result = await aiCategorize(tc.title, tc.description);
      console.log(`✅ "${tc.title}" → ${result}`);
    } catch (err) {
      console.error(`❌ Error:`, err.message);
    }
  }
  
  process.exit(0);
}

test();
