const fs = require('fs');
const cheerio = require('cheerio');

const content = fs.readFileSync('C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\ad8932a9-f9c9-4240-a53d-15ddd414f4b0\\.system_generated\\steps\\532\\content.md', 'utf8');

// Find occurrences of 12019 and print 100 characters before and after
let pos = content.indexOf('12019');
while (pos !== -1) {
  console.log(`\n--- Found 12019 at position ${pos} ---`);
  console.log(content.substring(pos - 150, pos + 150));
  pos = content.indexOf('12019', pos + 1);
}

// Let's also do a regex to search for any pattern like \"mt\":\"(\d+)\" or "mt":"(\d+)"
console.log('\nTesting regex for MT codes:');
const regexes = [
  /\\"mt\\":\\"(\d+)\\"/g,
  /\\"[Mm][Tt]\\":\\"(\d+)\\"/g,
  /\"mt\":\"(\d+)\"/g,
  /\"MT-(\d+)\"/g,
  /mt_code:\s*'([^']+)'/g,
  /mt:\s*'(\d+)'/g
];

regexes.forEach((regex, idx) => {
  const matches = new Set();
  let match;
  regex.lastIndex = 0; // reset
  while ((match = regex.exec(content)) !== null) {
    matches.add(match[1]);
  }
  console.log(`Regex ${idx} matches count:`, matches.size);
  if (matches.size > 0) {
    console.log(`Does it have 12019:`, matches.has('12019'));
    console.log(`Sample matches:`, Array.from(matches).slice(0, 10));
  }
});
