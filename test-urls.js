const urls = [
  "https://upload.wikimedia.org/wikipedia/commons/9/90/Caganer.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Porron_filled_with_red_wine.jpg/800px-Porron_filled_with_red_wine.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Espadrilles_1.jpg/800px-Espadrilles_1.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Park_G%C3%BCell_-_dragon.jpg/800px-Park_G%C3%BCell_-_dragon.jpg"
];

async function checkUrls() {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(res.status, res.statusText, url);
    } catch (e) {
      console.error("Error", url, e.message);
    }
  }
}
checkUrls();
