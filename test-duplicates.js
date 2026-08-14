const urls = [
  "https://images.unsplash.com/photo-1596773347957-c812c3f878b2?w=800",
  "https://images.unsplash.com/photo-1518114674716-e41c4bdcc1a3?w=800",
  "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800",
  "https://images.unsplash.com/photo-1544907910-8c55c2f3142d?w=800",
  "https://upload.wikimedia.org/wikipedia/commons/4/41/Bembel_mit_geripptem_3.jpg",
  "https://images.unsplash.com/photo-1582229562768-45e05a81df1b?w=800",
  "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800"
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
