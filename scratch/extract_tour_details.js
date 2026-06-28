const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\ad8932a9-f9c9-4240-a53d-15ddd414f4b0\\.system_generated\\steps\\532\\content.md', 'utf8');

// Let's find where 12019 is in the JSON and print the complete JSON object it belongs to
const index = content.indexOf('{"mt":"12019"');
const indexEscaped = content.indexOf('\\"mt\\":\\"12019\\"');

console.log('Index normal:', index);
console.log('Index escaped:', indexEscaped);

if (indexEscaped !== -1) {
  // Let's extract a larger chunk around indexEscaped
  const chunk = content.substring(indexEscaped - 100, indexEscaped + 1000);
  console.log('Chunk around escaped 12019:');
  console.log(chunk);
}
