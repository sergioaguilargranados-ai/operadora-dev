const url = "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800";
async function checkUrl() {
  try {
    const res = await fetch(url);
    console.log(res.status, url);
  } catch (e) {
    console.error("Error", url, e.message);
  }
}
checkUrl();
