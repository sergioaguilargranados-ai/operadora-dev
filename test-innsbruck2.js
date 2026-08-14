const urls = [
  "https://images.unsplash.com/photo-1574540451842-83b5dfbe9dcc?w=800",
  "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800"
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
