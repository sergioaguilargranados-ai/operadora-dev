require('dotenv').config({path: '.env.local'});

const { pool } = require('./src/lib/db');
const { DestinationContentService } = require('./src/services/DestinationContentService');

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';

async function fixImages() {
  const res = await pool.query("SELECT id, city, foods, places, souvenirs FROM destination_content");
  
  for (const row of res.rows) {
    let needsUpdate = false;
    
    // Check foods
    const foodsToUpdate = [];
    for (const food of row.foods) {
      if (food.img === FALLBACK_IMAGE) {
        foodsToUpdate.push({ name: food.name, image_search: food.name + " food " + row.city });
      }
    }
    
    // Check places
    const placesToUpdate = [];
    for (const place of row.places) {
      if (place.img === FALLBACK_IMAGE) {
        placesToUpdate.push({ name: place.name, image_search: place.name + " " + row.city });
      }
    }
    
    // Check souvenirs
    const souvenirsToUpdate = [];
    for (const souv of row.souvenirs) {
      if (souv.img === FALLBACK_IMAGE) {
        souvenirsToUpdate.push({ name: souv.name, image_search: souv.name + " souvenir " + row.city });
      }
    }
    
    if (foodsToUpdate.length > 0 || placesToUpdate.length > 0 || souvenirsToUpdate.length > 0) {
      console.log(`Fixing images for ${row.city}...`);
      
      const newFoodsImages = foodsToUpdate.length > 0 ? await DestinationContentService.fetchRealImages(foodsToUpdate) : [];
      const newPlacesImages = placesToUpdate.length > 0 ? await DestinationContentService.fetchRealImages(placesToUpdate) : [];
      const newSouvenirsImages = souvenirsToUpdate.length > 0 ? await DestinationContentService.fetchRealImages(souvenirsToUpdate) : [];
      
      const updatedFoods = row.foods.map(f => {
        const found = newFoodsImages.find(nf => nf.name === f.name);
        return found ? { ...f, img: found.img } : f;
      });
      
      const updatedPlaces = row.places.map(p => {
        const found = newPlacesImages.find(np => np.name === p.name);
        return found ? { ...p, img: found.img } : p;
      });
      
      const updatedSouvenirs = row.souvenirs.map(s => {
        const found = newSouvenirsImages.find(ns => ns.name === s.name);
        return found ? { ...s, img: found.img } : s;
      });
      
      await pool.query(
        "UPDATE destination_content SET foods = $1, places = $2, souvenirs = $3 WHERE id = $4",
        [JSON.stringify(updatedFoods), JSON.stringify(updatedPlaces), JSON.stringify(updatedSouvenirs), row.id]
      );
      
      console.log(`Updated ${row.city}`);
    }
  }
  
  console.log("Done fixing images!");
  process.exit(0);
}

fixImages();
