const urls = [
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800",
  "https://images.unsplash.com/photo-1593339316656-913ac8726e1e?w=800",
  "https://images.unsplash.com/photo-1498579150354-979475cb1ae1?w=800",
  "https://images.unsplash.com/photo-1542152862-23743013d31b?w=800"
];

async function checkUrls() {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(res.status, url);
    } catch (e) {
      console.error("Error", url, e.message);
    }
  }
}
checkUrls();
