-- Actualizar imagen del hero banner (Destino destacado)
UPDATE homepage_hero
SET image_url = 'https://thumbs.dreamstime.com/b/idyllic-scene-features-overwater-pool-turquoise-water-merging-ocean-palm-trees-frame-view-sun-loungers-luxury-resort-409091288.jpg',
    updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = 1;

-- Verificar
SELECT id, title, subtitle, image_url FROM homepage_hero WHERE tenant_id = 1;
