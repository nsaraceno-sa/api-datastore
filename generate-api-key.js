const crypto = require('crypto');

// Generate a secure API key
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate multiple API keys
function generateMultipleKeys(count = 5) {
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(generateApiKey());
  }
  return keys;
}

// Main execution
console.log('=== API Key Generator ===\n');

console.log('Single API Key:');
console.log(generateApiKey());

console.log('\nMultiple API Keys:');
const keys = generateMultipleKeys(5);
keys.forEach((key, index) => {
  console.log(`${index + 1}: ${key}`);
});

console.log('\n=== Environment Variable Format ===');
console.log(`API_KEY=${generateApiKey()}`);

console.log('\n=== Usage Instructions ===');
console.log('1. Set the API_KEY environment variable');
console.log('2. Or use the default key: your-default-api-key-2025');
console.log('3. Include the key in requests as:');
console.log('   - Header: x-api-key: YOUR_API_KEY');
console.log('   - Header: api-key: YOUR_API_KEY');
console.log('   - Query param: ?apiKey=YOUR_API_KEY');
