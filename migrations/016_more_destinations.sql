-- Migración 016: Agregar más destinos y datos
-- Fecha: 03 Enero 2026

-- Más destinos de vuelos
INSERT INTO flight_destinations (city, country, price_from, currency, image_url, airport_code, display_order, is_active) VALUES
('Miami', 'USA', 4500, 'MXN', 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=600&h=400&fit=crop', 'MIA', 5, true),
('Nueva York', 'USA', 6200, 'MXN', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop', 'JFK', 6, true),
('Madrid', 'España', 12500, 'MXN', 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=400&fit=crop', 'MAD', 7, true),
('París', 'Francia', 14000, 'MXN', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop', 'CDG', 8, true),
('Monterrey', 'México', 1500, 'MXN', 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=600&h=400&fit=crop', 'MTY', 9, true),
('Mérida', 'México', 2200, 'MXN', 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=600&h=400&fit=crop', 'MID', 10, true)
ON CONFLICT DO NOTHING;

-- Más destinos para explorar
INSERT INTO explore_destinations (destination_name, city, country, image_url, price_from, category, hotels_count, display_order, is_active) VALUES
('Playa del Carmen', 'Playa del Carmen', 'México', 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=600&h=400&fit=crop', 2200, 'playa', 678, 7, true),
('Guadalajara', 'Guadalajara', 'México', 'https://images.unsplash.com/photo-1605216663980-3474d4f5f7b5?w=600&h=400&fit=crop', 1400, 'ciudad', 445, 8, true),
('Puerto Vallarta', 'Puerto Vallarta', 'México', 'https://images.unsplash.com/photo-1554743365-5e9d141571f3?w=600&h=400&fit=crop', 2600, 'playa', 567, 9, true),
('Monterrey', 'Monterrey', 'México', 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=600&h=400&fit=crop', 1300, 'ciudad', 334, 10, true),
('Acapulco', 'Acapulco', 'México', 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=600&h=400&fit=crop', 1900, 'playa', 412, 11, true),
('Huatulco', 'Huatulco', 'México', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', 2400, 'playa', 198, 12, true)
ON CONFLICT DO NOTHING;

-- Más hospedajes favoritos
INSERT INTO accommodation_favorites (name, title, location, type, price_from, price_per_night, currency, rating, image_url, description, display_order, is_active) VALUES
('Hotel Xcaret México', 'Hotel Xcaret México', 'Riviera Maya, Quintana Roo', 'Resort All-Inclusive', 8500, 8500, 'MXN', 4.9, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', 'Resort todo incluido con acceso a parques', 4, true),
('Rosewood Mayakoba', 'Rosewood Mayakoba', 'Riviera Maya, Quintana Roo', 'Luxury Resort', 15000, 15000, 'MXN', 5.0, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop', 'Lujo frente al mar Caribe', 5, true),
('Las Alcobas CDMX', 'Las Alcobas CDMX', 'Polanco, CDMX', 'Boutique Hotel', 6200, 6200, 'MXN', 4.8, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop', 'Elegancia en el corazón de Polanco', 6, true)
ON CONFLICT DO NOTHING;

-- Más ofertas de fin de semana
INSERT INTO weekend_deals (name, location, price_per_night, original_price, currency, rating, image_url, description, display_order, is_active) VALUES
('Hard Rock Cancún', 'Cancún, Quintana Roo', 3500, 5385, 'MXN', 4.6, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop', 'All-inclusive con entretenimiento', 5, true),
('Live Aqua Beach Resort', 'Cancún, Quintana Roo', 4200, 5600, 'MXN', 4.8, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop', 'Solo adultos, todo incluido', 6, true),
('Hyatt Ziva Puerto Vallarta', 'Puerto Vallarta, Jalisco', 2800, 3500, 'MXN', 4.7, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', 'Resort familiar frente al mar', 7, true)
ON CONFLICT DO NOTHING;

-- Más paquetes vacacionales
INSERT INTO featured_packages (destination, package_name, includes, description, nights, price, currency, image_url, is_active, display_order) VALUES
('Puerto Vallarta', 'Romance en Vallarta', 'Vuelo + Hotel + Cenas románticas + Tour', 'Escapada romántica con cenas a la luz de las velas', 4, 22999, 'MXN', 'https://images.unsplash.com/photo-1554743365-5e9d141571f3?w=600&h=400&fit=crop', true, 4),
('Oaxaca', 'Cultura y Gastronomía', 'Vuelo + Hotel + Tours culturales + Clases de cocina', 'Descubre la riqueza cultural de Oaxaca', 3, 16999, 'MXN', 'https://images.unsplash.com/photo-1547995886-6dc09384c6e6?w=600&h=400&fit=crop', true, 5),
('San Miguel de Allende', 'Arte Colonial', 'Vuelo + Hotel Boutique + Tours + Vino', 'Experiencia artística en ciudad colonial', 3, 19500, 'MXN', 'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=600&h=400&fit=crop', true, 6)
ON CONFLICT DO NOTHING;

-- Más hospedajes únicos
INSERT INTO unique_stays (property_name, location, description, image_url, price_per_night, currency, rating, total_reviews, property_type, is_featured, display_order) VALUES
('Azulik Tulum', 'Tulum, Quintana Roo', 'Hotel ecológico de lujo en la selva', 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600&h=400&fit=crop', 12000, 'MXN', 4.9, 456, 'eco-luxury', true, 7),
('Hacienda de los Santos', 'Álamos, Sonora', 'Hacienda colonial restaurada', 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&h=400&fit=crop', 5500, 'MXN', 4.8, 234, 'hacienda', true, 8),
('Casa Oaxaca', 'Oaxaca, Oaxaca', 'Casa boutique en el centro histórico', 'https://images.unsplash.com/photo-1547995886-6dc09384c6e6?w=600&h=400&fit=crop', 3800, 'MXN', 4.7, 189, 'boutique', true, 9)
ON CONFLICT DO NOTHING;
