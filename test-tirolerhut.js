async function searchWikipediaImage(searchQuery, lang = 'es') {
  try {
    const searchRes = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=&format=json`);
    const searchData = await searchRes.json();
    
    if (searchData?.query?.search?.length > 0) {
      const title = searchData.query.search[0].title;
      console.log("Title found:", title);
      const imgRes = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`);
      const imgData = await imgRes.json();
      const pages = imgData?.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pages[pageId]?.original?.source) {
          console.log("Image found:", pages[pageId].original.source);
          return pages[pageId].original.source;
        }
      }
    }
  } catch(e) {
    console.error(e);
  }
}

searchWikipediaImage("Sombrero tirolés");
