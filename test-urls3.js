const urls = [
  "https://images.unsplash.com/photo-1548625361-ec853c8db418?w=800",
  "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
  "https://images.unsplash.com/photo-1583515152285-d8520cfdbd3a?w=800"
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
