const fs = require('fs');
const cheerio = require('cheerio');

const content = fs.readFileSync('C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\ad8932a9-f9c9-4240-a53d-15ddd414f4b0\\.system_generated\\steps\\532\\content.md', 'utf8');
const $ = cheerio.load(content);
const links = [];

$('a').each((i, el) => {
  const href = $(el).attr('href');
  if (href && href.includes('/viaje/')) {
    links.push(href);
  }
});

console.log('Found links count:', links.length);
console.log('Sample links:', links.slice(0, 10));

// Let's search script tags
console.log('\nAnalyzing script tags...');
let jsonMatches = [];
$('script').each((i, el) => {
  const html = $(el).html();
  if (html && html.includes('12019')) {
    console.log(`Script tag ${i} contains 12019, length:`, html.length);
  }
});

// Let's write a regex search on the entire HTML content to find all travel codes and names
const viajeRegex = /\/viaje\/[a-zA-Z0-9-]*-\d+\.html/g;
const matches = content.match(viajeRegex) || [];
console.log('\nRegex matches for travel URLs count:', matches.length);
console.log('Unique matches count:', new Set(matches).size);
console.log('Unique matches sample:', Array.from(new Set(matches)).slice(0, 10));
console.log('Does unique matches include 12019:', Array.from(new Set(matches)).some(m => m.includes('12019')));
