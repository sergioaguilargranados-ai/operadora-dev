async function searchWikipediaImage(searchQuery, lang = 'es') {
  try {
    const searchRes = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=&format=json`);
    const searchData = await searchRes.json();
    console.log("Search result:", searchData.query.search[0].title);
    
    const title = searchData.query.search[0].title;
    const imgRes = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`);
    const imgData = await imgRes.json();
    console.log(JSON.stringify(imgData));
  } catch(e) {
    console.error(e);
  }
}
searchWikipediaImage("Paella");
