require('dotenv').config({path: '.env.local'});
const pexelsKey = process.env.PEXELS_API_KEY;
const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

async function test(query) {
  console.log(`Testing query: "${query}"`);
  
  if (pexelsKey) {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, { headers: { Authorization: pexelsKey } });
    if (res.ok) {
      const data = await res.json();
      console.log(`Pexels results: ${data.total_results}, url: ${data?.photos?.[0]?.src?.large}`);
    } else {
      console.log(`Pexels error: ${res.status}`);
    }
  }

  if (unsplashKey) {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${unsplashKey}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`Unsplash results: ${data.total}, url: ${data?.results?.[0]?.urls?.regular}`);
    } else {
      const text = await res.text();
      console.log(`Unsplash error: ${res.status}`, text);
    }
  }
}

async function run() {
  await test("Pizza Romana");
  await test("Colosseum Rome");
  await test("Cacio e Pepe Rome");
}
run();
