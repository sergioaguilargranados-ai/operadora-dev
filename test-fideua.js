const urls = [
  "https://upload.wikimedia.org/wikipedia/commons/c/cd/Bocata_calamares.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/9/91/Pa_amb_tom%C3%A0quet.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/0/07/Fideu%C3%A0_-_Gandia_2.jpg"
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
