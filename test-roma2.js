const urls = [
  "https://images.unsplash.com/photo-1601142634808-38923eb7c560?w=800",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
  "https://images.unsplash.com/photo-1549417259-dbdb0f19c968?w=800"
];
async function checkUrls() {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(res.status, url);
    } catch (e) {}
  }
}
checkUrls();
