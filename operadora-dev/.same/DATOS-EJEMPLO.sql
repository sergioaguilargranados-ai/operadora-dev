-- ============================================
-- DATOS DE EJEMPLO - AS OPERADORA
-- Hoteles realistas en destinos populares
-- ============================================

-- Primero, insertar monedas si no existen
INSERT INTO currencies (code, name, symbol, decimal_places) VALUES
('MXN', 'Peso Mexicano', '$', 2),
('USD', 'Dólar Estadounidense', 'US$', 2),
('EUR', 'Euro', '€', 2)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- HOTELES EN CANCÚN (5 hoteles)
-- ============================================

INSERT INTO hotels (
  name, description, location, city, state, country,
  address, star_rating, price_per_night, currency, rating, total_reviews,
  amenities, images, check_in_time, check_out_time, cancellation_policy
) VALUES
(
  'Hotel Riu Cancún',
  'Resort todo incluido frente al mar en la Zona Hotelera con piscinas, restaurantes y entretenimiento nocturno. Perfecto para familias y parejas. Acceso directo a la playa de arena blanca y aguas turquesa.',
  'Zona Hotelera km 8.5',
  'Cancún',
  'Quintana Roo',
  'México',
  'Blvd. Kukulcan km 8.5, 77500 Cancún, Q.R., México',
  4,
  3500.00,
  'MXN',
  4.6,
  2847,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "beach_access": true, "parking": true, "air_conditioning": true, "all_inclusive": true}',
  '["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]',
  '15:00',
  '12:00',
  'Cancelación gratuita hasta 48 horas antes del check-in'
),
(
  'Grand Fiesta Americana Coral Beach',
  'Hotel de lujo con servicio de primer nivel, spa galardonado y gastronomía excepcional. Vista panorámica al mar Caribe. Ideal para viajes románticos y luna de miel.',
  'Zona Hotelera km 9.5',
  'Cancún',
  'Quintana Roo',
  'México',
  'Blvd. Kukulcan km 9.5, 77500 Cancún, Q.R., México',
  5,
  6800.00,
  'MXN',
  4.8,
  3421,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "beach_access": true, "concierge": true, "room_service": true, "valet_parking": true}',
  '["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1571896349842-33c89424de2d"]',
  '15:00',
  '12:00',
  'Cancelación gratuita hasta 72 horas antes del check-in. Depósito reembolsable.'
),
(
  'Hyatt Ziva Cancún',
  'Resort todo incluido en ubicación privilegiada rodeado de playas. Múltiples restaurantes de cocina internacional, actividades acuáticas y entretenimiento para toda la familia.',
  'Punta Cancún',
  'Cancún',
  'Quintana Roo',
  'México',
  'Blvd. Kukulcan, Punta Cancún, 77500 Cancún, Q.R., México',
  5,
  5200.00,
  'MXN',
  4.7,
  4156,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "beach_access": true, "kids_club": true, "water_sports": true, "all_inclusive": true}',
  '["https://images.unsplash.com/photo-1602002418082-a4443e081dd1", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"]',
  '16:00',
  '11:00',
  'Cancelación con cargo del 50% si es dentro de 7 días del check-in'
),
(
  'Hotel NYX Cancún',
  'Hotel boutique moderno con diseño contemporáneo y ambiente vibrante. Rooftop bar con vista al mar. Ubicación céntrica cerca de restaurantes y vida nocturna.',
  'Zona Hotelera km 9',
  'Cancún',
  'Quintana Roo',
  'México',
  'Blvd. Kukulcan km 9, 77500 Cancún, Q.R., México',
  4,
  2800.00,
  'MXN',
  4.5,
  1876,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "beach_access": true, "nightclub": true, "rooftop": true}',
  '["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"]',
  '15:00',
  '12:00',
  'Cancelación gratuita hasta 24 horas antes'
),
(
  'Seadust Cancún Family Resort',
  'Resort familiar all-inclusive con programas de entretenimiento para niños y adultos. Piscinas temáticas, mini golf y actividades diarias. Perfecto para familias.',
  'Zona Hotelera km 10',
  'Cancún',
  'Quintana Roo',
  'México',
  'Blvd. Kukulcan km 10, 77500 Cancún, Q.R., México',
  4,
  4100.00,
  'MXN',
  4.4,
  2934,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "beach_access": true, "kids_club": true, "playground": true, "all_inclusive": true, "water_park": true}',
  '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]',
  '15:00',
  '11:00',
  'Cancelación gratuita hasta 5 días antes del check-in'
);

-- ============================================
-- HOTELES EN PLAYA DEL CARMEN (4 hoteles)
-- ============================================

INSERT INTO hotels (
  name, description, location, city, state, country,
  address, star_rating, price_per_night, currency, rating, total_reviews,
  amenities, images, check_in_time, check_out_time, cancellation_policy
) VALUES
(
  'The Royal Playa del Carmen',
  'Resort de lujo solo para adultos con servicio personalizado. Habitaciones espaciosas con jacuzzi privado. Gastronomía gourmet y spa de clase mundial.',
  '5ta Avenida',
  'Playa del Carmen',
  'Quintana Roo',
  'México',
  'Calle Constituyentes Mz 14, 77710 Playa del Carmen, Q.R., México',
  5,
  7200.00,
  'MXN',
  4.9,
  2156,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "beach_access": true, "adults_only": true, "butler_service": true, "infinity_pool": true}',
  '["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"]',
  '15:00',
  '12:00',
  'Cancelación con cargo completo si es dentro de 14 días. Depósito no reembolsable.'
),
(
  'Hotel Xcaret México',
  'Resort sustentable all-fun inclusive con acceso a parques Xcaret, Xel-Há y Xplor. Ríos subterráneos, cenotes y naturaleza. Experiencia única mexicana.',
  'Carretera Chetumal - Pto. Juárez',
  'Playa del Carmen',
  'Quintana Roo',
  'México',
  'Carretera Chetumal - Puerto Juárez Km 282, 77710 Solidaridad, Q.R., México',
  5,
  8500.00,
  'MXN',
  4.8,
  5234,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "eco_friendly": true, "theme_park_access": true, "all_inclusive": true, "cenotes": true}',
  '["https://images.unsplash.com/photo-1571896349842-33c89424de2d"]',
  '15:00',
  '11:00',
  'Cancelación gratuita hasta 7 días antes. Después con cargo del 100%.'
),
(
  'Grand Hyatt Playa del Carmen',
  'Hotel moderno frente al mar con rooftop infinity pool. Diseño contemporáneo con toques mexicanos. Cerca de 5ta Avenida y Cozumel ferry.',
  'Playa Mamitas',
  'Playa del Carmen',
  'Quintana Roo',
  'México',
  'Calle 26 Norte, Gonzalo Guerrero, 77720 Playa del Carmen, Q.R., México',
  5,
  5600.00,
  'MXN',
  4.7,
  3421,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "beach_access": true, "rooftop_pool": true, "concierge": true}',
  '["https://images.unsplash.com/photo-1566073771259-6a8506099945"]',
  '16:00',
  '12:00',
  'Cancelación gratuita hasta 48 horas antes del check-in'
),
(
  'Mahekal Beach Resort',
  'Resort boutique estilo caribeño con cabañas palapa frente al mar. Ambiente relajado y romántico. Playa privada y decoración artesanal mexicana.',
  'Playa Centro',
  'Playa del Carmen',
  'Quintana Roo',
  'México',
  'Calle 38 Norte, 77710 Playa del Carmen, Q.R., México',
  4,
  3400.00,
  'MXN',
  4.6,
  2876,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "spa": true, "beach_access": true, "yoga": true, "eco_friendly": true, "boutique": true}',
  '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]',
  '15:00',
  '11:00',
  'Cancelación gratuita hasta 72 horas antes del check-in'
);

-- ============================================
-- HOTELES EN TULUM (3 hoteles)
-- ============================================

INSERT INTO hotels (
  name, description, location, city, state, country,
  address, star_rating, price_per_night, currency, rating, total_reviews,
  amenities, images, check_in_time, check_out_time, cancellation_policy
) VALUES
(
  'Azulik Tulum',
  'Eco-resort de lujo sin electricidad ni WiFi para desconexión total. Villas de madera sobre el mar. Spa en árboles y arte contemporáneo. Experiencia única adults-only.',
  'Zona Hotelera',
  'Tulum',
  'Quintana Roo',
  'México',
  'Carretera Tulum-Boca Paila Km 5, 77780 Tulum, Q.R., México',
  5,
  12000.00,
  'MXN',
  4.5,
  1234,
  '{"pool": true, "restaurant": true, "bar": true, "spa": true, "beach_access": true, "adults_only": true, "eco_friendly": true, "art_gallery": true, "yoga": true}',
  '["https://images.unsplash.com/photo-1602002418082-a4443e081dd1"]',
  '15:00',
  '11:00',
  'Depósito no reembolsable. No se permiten cancelaciones.'
),
(
  'Hotel Be Tulum',
  'Boutique hotel con arquitectura minimalista y lujo discreto. Habitaciones con vista al mar y piscina privada. Playa virgen y ambiente bohemio chic.',
  'Zona Hotelera',
  'Tulum',
  'Quintana Roo',
  'México',
  'Carretera Tulum-Boca Paila Km 10, 77780 Tulum, Q.R., México',
  5,
  8900.00,
  'MXN',
  4.7,
  1876,
  '{"pool": true, "restaurant": true, "bar": true, "spa": true, "beach_access": true, "private_pool": true, "yoga": true, "boutique": true}',
  '["https://images.unsplash.com/photo-1571896349842-33c89424de2d"]',
  '15:00',
  '12:00',
  'Cancelación con cargo del 50% si es dentro de 30 días del check-in'
),
(
  'Dreams Tulum Resort & Spa',
  'Resort all-inclusive familiar en playa privada. Servicio Unlimited-Luxury con amenidades premium. Actividades para niños y adultos. Cerca de ruinas mayas.',
  'Playa Paraíso',
  'Tulum',
  'Quintana Roo',
  'México',
  'Carretera Cancún-Tulum Km 236.7, 77780 Tulum, Q.R., México',
  5,
  6300.00,
  'MXN',
  4.6,
  3567,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "beach_access": true, "kids_club": true, "all_inclusive": true, "water_sports": true}',
  '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]',
  '15:00',
  '11:00',
  'Cancelación gratuita hasta 7 días antes del check-in'
);

-- ============================================
-- HOTELES EN LOS CABOS (4 hoteles)
-- ============================================

INSERT INTO hotels (
  name, description, location, city, state, country,
  address, star_rating, price_per_night, currency, rating, total_reviews,
  amenities, images, check_in_time, check_out_time, cancellation_policy
) VALUES
(
  'Waldorf Astoria Los Cabos Pedregal',
  'Resort de ultra lujo con entrada privada por túnel iluminado. Villas con piscina infinity privada y vista al Pacífico. Servicio de mayordomo 24/7.',
  'Camino del Mar',
  'Cabo San Lucas',
  'Baja California Sur',
  'México',
  'Camino del Mar 1, Pedregal, 23455 Cabo San Lucas, B.C.S., México',
  5,
  15000.00,
  'MXN',
  4.9,
  2345,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "beach_access": true, "butler_service": true, "golf": true, "private_pool": true}',
  '["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"]',
  '16:00',
  '12:00',
  'Cancelación con cargo completo si es dentro de 21 días. Depósito no reembolsable.'
),
(
  'Grand Velas Los Cabos',
  'All-inclusive de lujo con suites espaciosas y servicio excepcional. Gastronomía gourmet en restaurantes de autor. Spa de clase mundial.',
  'San José del Cabo',
  'San José del Cabo',
  'Baja California Sur',
  'México',
  'Carretera Transpeninsular Km 17, 23400 San José del Cabo, B.C.S., México',
  5,
  9800.00,
  'MXN',
  4.8,
  3210,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "beach_access": true, "all_inclusive": true, "kids_club": true, "fine_dining": true}',
  '["https://images.unsplash.com/photo-1566073771259-6a8506099945"]',
  '15:00',
  '11:00',
  'Cancelación gratuita hasta 14 días antes del check-in'
),
(
  'Hard Rock Hotel Los Cabos',
  'Resort all-inclusive con ambiente rockero y entretenimiento en vivo. Piscinas con música subacuática. Memorabilia musical y conciertos.',
  'Corredor Turístico',
  'Cabo San Lucas',
  'Baja California Sur',
  'México',
  'Carretera Transpeninsular Km 9.5, 23410 Cabo San Lucas, B.C.S., México',
  5,
  5400.00,
  'MXN',
  4.6,
  4123,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "beach_access": true, "all_inclusive": true, "live_music": true, "nightclub": true}',
  '["https://images.unsplash.com/photo-1571896349842-33c89424de2d"]',
  '15:00',
  '12:00',
  'Cancelación gratuita hasta 5 días antes del check-in'
),
(
  'Pueblo Bonito Sunset Beach',
  'Resort frente al Pacífico con vista espectacular de El Arco. Infinity pools y arquitectura mediterránea. Ambiente tranquilo y romántico.',
  'Playa El Médano',
  'Cabo San Lucas',
  'Baja California Sur',
  'México',
  'Predio Paraíso Escondido, 23450 Cabo San Lucas, B.C.S., México',
  5,
  6700.00,
  'MXN',
  4.7,
  2987,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "beach_access": true, "infinity_pool": true, "golf": true}',
  '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]',
  '16:00',
  '11:00',
  'Cancelación gratuita hasta 72 horas antes del check-in'
);

-- ============================================
-- HOTELES EN CIUDAD DE MÉXICO (4 hoteles)
-- ============================================

INSERT INTO hotels (
  name, description, location, city, state, country,
  address, star_rating, price_per_night, currency, rating, total_reviews,
  amenities, images, check_in_time, check_out_time, cancellation_policy
) VALUES
(
  'Four Seasons Hotel Mexico City',
  'Hotel de lujo en Paseo de la Reforma con vistas al Bosque de Chapultepec. Servicio impecable y gastronomía excepcional. Ideal para viajes de negocios y placer.',
  'Paseo de la Reforma',
  'Ciudad de México',
  'Ciudad de México',
  'México',
  'Paseo de la Reforma 500, 06600 Ciudad de México, CDMX, México',
  5,
  4200.00,
  'MXN',
  4.8,
  3456,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "business_center": true, "concierge": true, "valet_parking": true}',
  '["https://images.unsplash.com/photo-1566073771259-6a8506099945"]',
  '15:00',
  '12:00',
  'Cancelación gratuita hasta 48 horas antes del check-in'
),
(
  'Hotel Downtown Mexico',
  'Boutique hotel en edificio histórico del centro. Diseño contemporáneo con elementos coloniales. Rooftop bar con vista al Palacio de Bellas Artes.',
  'Centro Histórico',
  'Ciudad de México',
  'Ciudad de México',
  'México',
  'Isabel la Católica 30, 06000 Ciudad de México, CDMX, México',
  4,
  1800.00,
  'MXN',
  4.6,
  2134,
  '{"wifi": true, "restaurant": true, "bar": true, "gym": true, "rooftop": true, "boutique": true, "art_gallery": true}',
  '["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"]',
  '15:00',
  '12:00',
  'Cancelación gratuita hasta 24 horas antes del check-in'
),
(
  'St. Regis Mexico City',
  'Hotel icónico en Paseo de la Reforma con servicio de mayordomo. Elegancia clásica y lujo moderno. Cerca de museos y Zona Rosa.',
  'Paseo de la Reforma',
  'Ciudad de México',
  'Ciudad de México',
  'México',
  'Paseo de la Reforma 439, 06500 Ciudad de México, CDMX, México',
  5,
  5600.00,
  'MXN',
  4.9,
  2876,
  '{"wifi": true, "pool": true, "restaurant": true, "bar": true, "gym": true, "spa": true, "butler_service": true, "business_center": true, "fine_dining": true}',
  '["https://images.unsplash.com/photo-1571896349842-33c89424de2d"]',
  '15:00',
  '12:00',
  'Cancelación gratuita hasta 72 horas antes del check-in. Depósito reembolsable.'
),
(
  'Chaya B&B',
  'Bed & Breakfast boutique en La Roma. Ambiente hogareño y personalizado. Desayuno incluido con productos locales. Perfecto para viajeros independientes.',
  'La Roma',
  'Ciudad de México',
  'Ciudad de México',
  'México',
  'Calle Zacatecas 109, 06700 Ciudad de México, CDMX, México',
  3,
  950.00,
  'MXN',
  4.7,
  987,
  '{"wifi": true, "breakfast_included": true, "boutique": true, "pet_friendly": true, "garden": true}',
  '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]',
  '14:00',
  '11:00',
  'Cancelación gratuita hasta 48 horas antes del check-in'
);

-- ============================================
-- Actualizar secuencias
-- ============================================

SELECT setval('hotels_id_seq', (SELECT MAX(id) FROM hotels));
SELECT setval('currencies_id_seq', (SELECT MAX(id) FROM currencies));

-- ============================================
-- Verificar datos insertados
-- ============================================

SELECT
  city,
  COUNT(*) as total_hotels,
  ROUND(AVG(price_per_night), 2) as avg_price,
  ROUND(AVG(rating), 1) as avg_rating
FROM hotels
GROUP BY city
ORDER BY total_hotels DESC;

-- ============================================
-- FIN - 20 hoteles insertados
-- ============================================
