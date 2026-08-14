const urls = [
  "https://images.unsplash.com/photo-1623910271018-0955517173b2?w=800",
  "https://images.unsplash.com/photo-1528646194783-c0529d84cbfd?w=800",
  "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800"
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
