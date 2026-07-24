const urls = [
  "https://images.unsplash.com/photo-1779119381168-d75935e4742e",
  "https://images.unsplash.com/photo-1602493701683-cdb387086ec3",
  "https://images.unsplash.com/photo-1554371650-4484f3a102f2",
  "https://images.unsplash.com/photo-1639667911189-700bd2029f5b",
  "https://images.unsplash.com/photo-1745186487034-1fb021059216",
  "https://images.unsplash.com/photo-1650964827770-421afa7960ac",
  "https://images.unsplash.com/photo-1630219694734-fe47ab76b15e",
  "https://images.unsplash.com/photo-1508939546992-1252a12b4299",
  "https://images.unsplash.com/photo-1464730282481-19bd52679224",
  "https://images.unsplash.com/photo-1542371326-36fbff2dc61f",
  "https://images.unsplash.com/photo-1719861033345-97edecd17ae9"
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
