require('dotenv').config();

const requiredEnv = [
  'MONGODB_URI',
  'SSLCOMMERZ_STORE_ID',
  'SSLCOMMERZ_STORE_PASSWORD',
  'SSLCOMMERZ_SESSION_API',
  'SSLCOMMERZ_VALIDATION_API',
  'SERVER_URL',
  'CLIENT_URL'
];

console.log('--- Environment Check ---');
requiredEnv.forEach(env => {
  if (process.env[env]) {
    console.log(`✅ ${env} is set.`);
  } else {
    console.log(`❌ ${env} is MISSING!`);
  }
});
console.log('-------------------------');
process.env.GEMINI_API_KEY ? 'Set' : 'Missing'
