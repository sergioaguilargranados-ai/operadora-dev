async function testWiki(query) {
  // 1. Search for the title
  const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`);
  const searchData = await searchRes.json();
  
  if (searchData.query.search.length > 0) {
    const title = searchData.query.search[0].title;
    
    // 2. Get the image for the title
    const imgRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`);
    const imgData = await imgRes.json();
    
    const pages = imgData.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pages[pageId].original && pages[pageId].original.source) {
      console.log(`Wiki for ${query}: ${pages[pageId].original.source}`);
      return pages[pageId].original.source;
    }
  }
  console.log(`Wiki for ${query}: Not found`);
  return null;
}

async function run() {
  await testWiki("Colosseum Rome");
  await testWiki("Cacio e Pepe");
  await testWiki("Eiffel Tower");
}
run();
