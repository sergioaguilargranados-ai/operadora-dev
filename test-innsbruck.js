const urls = [
  "https://upload.wikimedia.org/wikipedia/commons/e/e4/Swarovski_Kirstallwelten.JPG",
  "https://upload.wikimedia.org/wikipedia/commons/8/87/Tirolerhut.jpg"
];

async function checkUrls() {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(res.status, url);
    } catch (e) {
      console.error(e);
    }
  }
}
checkUrls();
