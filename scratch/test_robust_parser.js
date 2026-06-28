const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\ad8932a9-f9c9-4240-a53d-15ddd414f4b0\\.system_generated\\steps\\532\\content.md', 'utf8');

// Find all JSON-like objects containing mt codes
// The objects can have escaped double quotes: \\"mt\\":\\"12019\\"
// Let's find all occurrences of \\"mt\\":\\"(\d+)\\"
const regex = /({[^{}]*\\"mt\\":\\"\d+\\"[^{}]*})/g;
const matches = content.match(regex) || [];
console.log('Regex 1 matches count:', matches.length);

const tours = new Map();

// Let's try to match objects more flexibly
// We can scan for \\"mt\\":\\"(\d+)\\" and extract the JSON object around it by matching braces
const mtSearchStr = '\\"mt\\":\\"';
let pos = content.indexOf(mtSearchStr);
while (pos !== -1) {
  // Find the start of the object (the nearest '{' before this position)
  let startBrace = content.lastIndexOf('{', pos);
  
  // Find the end of the object (the nearest '}' after this position)
  let endBrace = content.indexOf('}', pos);
  
  if (startBrace !== -1 && endBrace !== -1 && startBrace < endBrace) {
    const rawObj = content.substring(startBrace, endBrace + 1);
    try {
      // Clean up the escaped quotes to parse as standard JSON
      // E.g., replace \\" with "
      const cleanJson = rawObj
        .replace(/\\"/g, '"')
        .replace(/\\\//g, '/')
        .replace(/\\n/g, ' ')
        .replace(/\\t/g, ' ');
      
      const parsed = JSON.parse(cleanJson);
      if (parsed.mt && parsed.slug) {
        tours.set(parsed.mt, {
          mt_code: `MT-${parsed.mt}`,
          name: parsed.name ? parsed.name.replace(/\.$/, '') : 'Tour',
          slug: parsed.slug,
          url: `https://www.megatravel.com.mx/viaje/${parsed.slug}-${parsed.mt}.html`
        });
      }
    } catch (e) {
      // Sometimes it fails because it's a partial match or contains nested structures, we can try to extract mt and slug with regex
      const mtMatch = rawObj.match(/\\"mt\\":\\"(\d+)\\"/);
      const slugMatch = rawObj.match(/\\"slug\\":\\"([a-zA-Z0-9-]+)\\"/);
      const nameMatch = rawObj.match(/\\"name\\":\\"([^\\"]+)\\"/);
      
      if (mtMatch && slugMatch) {
        tours.set(mtMatch[1], {
          mt_code: `MT-${mtMatch[1]}`,
          name: nameMatch ? nameMatch[1].replace(/\.$/, '') : 'Tour',
          slug: slugMatch[1],
          url: `https://www.megatravel.com.mx/viaje/${slugMatch[1]}-${mtMatch[1]}.html`
        });
      }
    }
  }
  
  pos = content.indexOf(mtSearchStr, pos + 1);
}

console.log('Robust extracted tours count:', tours.size);
console.log('Does it contain 12019:', tours.has('12019'));
console.log('12019 details:', tours.get('12019'));
console.log('Sample extracted tours:', Array.from(tours.values()).slice(0, 10));
