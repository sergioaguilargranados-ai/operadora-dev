-- Migración 044: Tablas para Landing Expo
-- --------------------------------------------------------

-- Tabla para almacenar el contenido dinámico de la landing de la Expo
CREATE TABLE IF NOT EXISTS expo_landing_content (
    id SERIAL PRIMARY KEY,
    hero_video_url TEXT,
    hero_title VARCHAR(255),
    hero_subtitle TEXT,
    sections_json JSONB DEFAULT '[]', -- Para almacenar arreglos de secciones de manera dinámica {title, text, image_url}
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255)
);

-- Insertar un registro inicial por defecto
INSERT INTO expo_landing_content (hero_video_url, hero_title, hero_subtitle, sections_json)
VALUES (
    'https://www.w3schools.com/html/mov_bbb.mp4', -- Video de placeholder
    'AS Operadora en la Expo 2026',
    'Descubre las mejores opciones de viaje corporativo y recompensas.',
    '[{"title": "Viajes Corporativos", "text": "Gestionamos todos los viajes de tu empresa con eficiencia.", "image_url": ""}, {"title": "Recompensas", "text": "Nuestro programa de lealtad te da más.", "image_url": ""}]'
)
ON CONFLICT DO NOTHING; -- Asumiendo que no hay constraints únicos, esto simplemente insertará si está vacío. Pero no tenemos UNIQUE, así que usaremos un check o no importa si se inserta múltiple, en la API leeremos el ID=1 o el primer row.

-- Mejor hacer un truncate si queremos asegurar solo un registro o leer el último:
-- Pero en este caso, se leerá ordenado por id DESC limit 1 o se actuará sobre el id=1.


-- Tabla para almacenar los registros (leads) de la Expo
CREATE TABLE IF NOT EXISTS expo_leads (
    id SERIAL PRIMARY KEY,
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    agency_name VARCHAR(255),
    website VARCHAR(255),
    social_media TEXT,
    email VARCHAR(255),
    job_title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
