const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const newSectionsJson = {
  "ayudas": {
    "title": "¿CÓMO PODEMOS AYUDARTE?",
    "items": [
      { "title": "Viajeros", "img": "14WhatsApp_Image_2026-06-12_at_6.00.02_PM_(1).jpeg", "bullets": ["Paquetes personalizados", "Viajes grupales", "Cruceros"], "action": "Explorar viajes" },
      { "title": "Agencias de Viajes", "img": "8WhatsApp_Image_2026-06-12_at_11.15.56_AM.jpeg", "bullets": ["Tarifas preferenciales", "Creación de grupos", "Soporte especializado 24/7"], "action": "Afiliar mi agencia de viajes" },
      { "title": "Agencias de Eventos", "img": "7WhatsApp_Image_2026-06-12_at_11.15.56_AM.jpeg", "bullets": ["Organización integral", "Logística y producción", "Proveedores especializados"], "action": "Conocer más" },
      { "title": "Empresas", "img": "6WhatsApp_Image_2026-06-12_at_11.15.56_AM.jpeg", "bullets": ["Viajes incentivos", "Congresos y ferias", "Integración de equipos"], "action": "Solicitar propuesta" }
    ]
  },
  "destinos": {
    "title": "DESTINOS QUE TE ESPERAN",
    "heading": "Descubre el mundo",
    "desc": "Cada continente, experiencias únicas y momentos que recordarás siempre.",
    "items": [
      { "name": "América", "desc": "Naturaleza, cultura y aventura", "img": "1WhatsApp_Image_2026-06-12_at_11.15.55_AM.jpeg" },
      { "name": "Europa", "desc": "Historia, arte y elegancia", "img": "3WhatsApp_Image_2026-06-12_at_11.15.55_AM.jpeg" },
      { "name": "África", "desc": "Vida salvaje y paisajes únicos", "img": "4WhatsApp_Image_2026-06-12_at_11.15.55_AM.jpeg" },
      { "name": "Asia", "desc": "Tradición, modernidad e inspiración", "img": "5WhatsApp_Image_2026-06-12_at_11.15.55_AM.jpeg" },
      { "name": "Oceanía", "desc": "Playas, ciudades y naturaleza excepcional", "img": "11WhatsApp_Image_2026-06-12_at_11.15.57_AM.jpeg" }
    ]
  },
  "servicios": {
    "title": "NUESTROS SERVICIOS",
    "heading": "Soluciones para cada necesidad",
    "items": [
      { "title": "Viajes Vacacionales", "desc": "Experiencias diseñadas para disfrutar, descansar y crear recuerdos inolvidables.", "img": "6WhatsApp_Image_2026-06-12_at_11.15.56_AM.jpeg" },
      { "title": "Grupos y Convenciones", "desc": "Organizamos eventos y viajes que conectan, motivan y generan impacto.", "img": "7WhatsApp_Image_2026-06-12_at_11.15.56_AM.jpeg" },
      { "title": "Operación para Agencias", "desc": "Herramientas, tarifas competitivas y acompañamiento experto.", "img": "8WhatsApp_Image_2026-06-12_at_11.15.56_AM.jpeg" }
    ]
  },
  "beneficios": {
    "items": [
      { "title": "Experiencias memorables", "desc": "Diseñamos viajes cuidadosamente para cada necesidad y presupuesto." },
      { "title": "Atención personalizada", "desc": "Un asesor te acompañará antes, durante y después de tu viaje." },
      { "title": "Destinos selectos", "desc": "Opciones nacionales e internacionales para cada tipo de viajero y empresa." },
      { "title": "Protección de datos", "desc": "Tu información está segura con tecnología y procesos certificados." }
    ]
  },
  "aliado": {
    "badge": "PARA AGENCIAS DE VIAJES",
    "title": "Tu aliado de negocios",
    "desc": "Trabajamos juntos para que tu agencia crezca más, con la tranquilidad de tener un equipo que te respalda.",
    "img": "13WhatsApp_Image_2026-06-12_at_12.23.41_PM.jpeg",
    "items": [
      { "title": "Herramientas", "desc": "Plataforma fácil de usar para cotizar, reservar y administrar." },
      { "title": "Tarifas competitivas", "desc": "Acceso a tarifas preferenciales y promociones exclusivas para tu agencia." },
      { "title": "Acompañamiento experto", "desc": "Soporte y capacitación constante para impulsar tu crecimiento." }
    ]
  }
};

async function main() {
  try {
    const res = await pool.query(
      `UPDATE expo_landing_content SET sections_json = $1`,
      [JSON.stringify(newSectionsJson)]
    );
    console.log('Update result:', res.rowCount);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
