const urls = [
  "https://images.unsplash.com/photo-1548882583-b9df7413d719?w=800",
  "https://upload.wikimedia.org/wikipedia/commons/f/fa/Swiss_Army_Knife_by_Victorinox.jpg",
  "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800",
  "https://upload.wikimedia.org/wikipedia/commons/8/87/Treicheln.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/6/63/Emmentaler_K%C3%A4se.jpg"
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
