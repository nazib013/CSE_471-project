const { aiCategorize } = require('./utils/categorizer');

async function test() {
  console.log('\n📝 Testing AI Categorizer...\n');
  
  const testCases = [
    { title: 'cat litter', description: 'fresh 5 kg' },
    { title: 'first aid kit', description: '12 new packs' },
    { title: 'dog food', description: 'premium kibble' },
    { title: 'toys set', description: 'rubber balls and rope' }
  ];
  
  for (const test of testCases) {
    try {
      const result = await aiCategorize(test.title, test.description);
      console.log(`✅ "${test.title}" → ${result}`);
    } catch (err) {
      console.error(`❌ Error testing "${test.title}":`, err.message);
    }
  }
  
  process.exit(0);
}

test();
