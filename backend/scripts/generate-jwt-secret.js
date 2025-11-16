// Generate secure JWT secret
// Usage: node scripts/generate-jwt-secret.js

const crypto = require('crypto');

console.log('🔑 Generating secure JWT secret...\n');

// Generate 32 bytes (256 bits) random secret
const secret = crypto.randomBytes(32).toString('hex');

console.log('Your JWT Secret:');
console.log('━'.repeat(70));
console.log(secret);
console.log('━'.repeat(70));
console.log('\n✅ Length:', secret.length, 'characters');
console.log('✅ Entropy: 256 bits (very secure)');
console.log('\n📋 Copy this to your Railway environment variables:');
console.log(`   JWT_SECRET=${secret}`);
console.log('\n⚠️  IMPORTANT: Keep this secret safe! Do NOT commit to git.');
console.log('   Store it securely in Railway dashboard or .env (local only).');
console.log('\n💡 TIP: Generate a new secret for each environment (dev/staging/prod).');
