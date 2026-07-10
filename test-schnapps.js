const urls = [
  "https://upload.wikimedia.org/wikipedia/commons/e/ea/Obstler.jpg",
  "https://images.unsplash.com/photo-1544907910-8c55c2f3142d?w=800"
];

async function check() {
  for (const u of urls) {
    try {
      const r = await fetch(u);
      console.log(r.status, u);
    } catch(e) {}
  }
}
check();
