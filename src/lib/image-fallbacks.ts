/**
 * image-fallbacks.ts
 * Catálogo inteligente de imágenes de alta resolución categorizadas por tipo y destino.
 * Garantiza que NUNCA exista una imagen rota o fuera de contexto en la app.
 */

// ==================== CATÁLOGO CURADO DE GASTRONOMÍA ====================
export const FOOD_CATALOG: Record<string, string> = {
  // Comida Británica / Londres
  'fish and chips': 'https://images.unsplash.com/photo-1579208030886-b937da0925dc?auto=format&fit=crop&w=600&q=80',
  'fish & chips': 'https://images.unsplash.com/photo-1579208030886-b937da0925dc?auto=format&fit=crop&w=600&q=80',
  'sunday roast': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'full english breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
  'english breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
  'shepherd pie': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  'afternoon tea': 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&w=600&q=80',

  // Comida Francesa / París
  'croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
  'baguette': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'ratatouille': 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=600&q=80',
  'crepes': 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=600&q=80',
  'macarons': 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80',
  'fondue': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
  'escargot': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'quiche': 'https://images.unsplash.com/photo-1554998171-7e599bc95ccd?auto=format&fit=crop&w=600&q=80',

  // Comida Italiana / Roma / Venecia / Florencia
  'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  'pasta': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
  'carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80',
  'gelato': 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80',
  'tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
  'risotto': 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80',
  'lasagna': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80',

  // Comida Española / Madrid / Barcelona
  'paella': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=600&q=80',
  'tapas': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
  'churros': 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?auto=format&fit=crop&w=600&q=80',
  'jamon': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'tortilla': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',

  // Comida Mexicana
  'tacos': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
  'guacamole': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  'mole': 'https://images.unsplash.com/photo-1584947926185-3b950b73c242?auto=format&fit=crop&w=600&q=80',
  'enchiladas': 'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?auto=format&fit=crop&w=600&q=80',

  // General / Fallbacks
  'desayuno': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
  'cafe': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
  'postre': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
  'default': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
};

// ==================== CATÁLOGO CURADO DE MONUMENTOS Y LUGARES ====================
export const PLACE_CATALOG: Record<string, string> = {
  // Londres / UK
  'torre de londres': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  'tower of london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  'british museum': 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
  'museo britanico': 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
  'palacio de buckingham': 'https://images.unsplash.com/photo-1584448141569-69f342da535c?auto=format&fit=crop&w=800&q=80',
  'buckingham': 'https://images.unsplash.com/photo-1584448141569-69f342da535c?auto=format&fit=crop&w=800&q=80',
  'camden': 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=800&q=80',
  'big ben': 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80',
  'london eye': 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80',
  'tower bridge': 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=800&q=80',
  'westminster': 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80',

  // París / Francia
  'torre eiffel': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  'eiffel': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  'louvre': 'https://images.unsplash.com/photo-1499856871958-5b9337606a3e?auto=format&fit=crop&w=800&q=80',
  'arco del triunfo': 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80',
  'notre dame': 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80',
  'versalles': 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=800&q=80',

  // Roma / Italia
  'coliseo': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
  'colosseum': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
  'fontana di trevi': 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=800&q=80',
  'vaticano': 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80',
  'panteon': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',

  // España
  'sagrada familia': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80',
  'plaza mayor': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
  'palacio real': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80',
  'gran via': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',

  // Destinos Generales
  'europa': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
  'vuelo': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
  'avion': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
};

// ==================== CATÁLOGO CURADO DE CIUDADES / HERO ====================
export const CITY_HERO_CATALOG: Record<string, string> = {
  'londres': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  'parís': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  'roma': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
  'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
  'venecia': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
  'venice': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
  'florencia': 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1200&q=80',
  'madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
  'barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
  'amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1200&q=80',
  'berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80',
  'praga': 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1200&q=80',
  'viena': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1200&q=80',
  'budapest': 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=1200&q=80',
  'mexico': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80',
  'cancun': 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=1200&q=80',
  'tokio': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
  'vuelo': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
  'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
};

// ==================== CATÁLOGO CURADO DE SOUVENIRS ====================
export const SOUVENIR_CATALOG: Record<string, string> = {
  'te': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'tea': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'perfume': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
  'vino': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
  'chocolate': 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80',
  'ceramica': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
  'artesania': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
  'default': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'
};

// ==================== FUNCIONES HELPER ====================

/**
 * Obtiene la imagen de respaldo más adecuada para un platillo
 */
export function getFoodFallback(name?: string, city?: string): string {
  const query = `${name || ''} ${city || ''}`.toLowerCase();
  for (const [key, url] of Object.entries(FOOD_CATALOG)) {
    if (query.includes(key)) return url;
  }
  return FOOD_CATALOG.default;
}

/**
 * Obtiene la imagen de respaldo más adecuada para un lugar o monumento
 */
export function getPlaceFallback(name?: string, city?: string): string {
  const query = `${name || ''} ${city || ''}`.toLowerCase();
  for (const [key, url] of Object.entries(PLACE_CATALOG)) {
    if (query.includes(key)) return url;
  }
  return PLACE_CATALOG.default;
}

/**
 * Obtiene la imagen de cabecera más adecuada para una ciudad
 */
export function getHeroFallback(cityOrDestination?: string): string {
  const query = (cityOrDestination || '').toLowerCase();
  for (const [key, url] of Object.entries(CITY_HERO_CATALOG)) {
    if (query.includes(key)) return url;
  }
  return CITY_HERO_CATALOG.default;
}

/**
 * Obtiene la imagen de respaldo para un souvenir
 */
export function getSouvenirFallback(name?: string, city?: string): string {
  const query = `${name || ''} ${city || ''}`.toLowerCase();
  for (const [key, url] of Object.entries(SOUVENIR_CATALOG)) {
    if (query.includes(key)) return url;
  }
  return SOUVENIR_CATALOG.default;
}

/**
 * Validador de URL de imagen. Detecta URLs genéricas obsoletas (como la combi en el desierto)
 */
export function isInvalidOrGenericImage(url?: string): boolean {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === 'about:blank' || trimmed === 'null' || trimmed === 'undefined') return true;
  // URL de la combi en el desierto que se usaba como fallback global
  if (trimmed.includes('photo-1469854523086-cc02fe5d8800')) return true;
  return false;
}

/**
 * Manejador inteligente onError para cualquier <img> de React
 */
export function handleImageFallback(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackType: 'food' | 'place' | 'hero' | 'souvenir' | 'general' = 'general',
  itemName?: string,
  city?: string
) {
  const target = e.currentTarget;
  // Evitar loops infinitos de error si el fallback también fallase
  if (target.dataset.fallbackApplied === 'true') return;
  target.dataset.fallbackApplied = 'true';

  let fallbackUrl = PLACE_CATALOG.default;
  if (fallbackType === 'food') fallbackUrl = getFoodFallback(itemName, city);
  else if (fallbackType === 'place') fallbackUrl = getPlaceFallback(itemName, city);
  else if (fallbackType === 'hero') fallbackUrl = getHeroFallback(city || itemName);
  else if (fallbackType === 'souvenir') fallbackUrl = getSouvenirFallback(itemName, city);

  target.src = fallbackUrl;
}
