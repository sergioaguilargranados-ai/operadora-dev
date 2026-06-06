// Build: 03 Jun 2026 - 16:00 CST - v2.342

/**
 * Modelos Unificados de Viajes (Hoteles y Vuelos)
 * 
 * Estos tipos representan el formato estándar que el frontend consumirá.
 * Los adaptadores de cada proveedor (Duffel, Hotelbeds, RateHawk) traducirán
 * sus respuestas propietarias a estos formatos.
 */

// ==========================================
// VUELOS (FLIGHTS)
// ==========================================

export interface VueloUnificado {
  id: string; // ID unificado o ID compuesto (proveedor_id)
  proveedor: 'duffel' | 'amadeus' | string;
  referenciaProveedor: string;
  precioTotal: number;
  moneda: string;
  itinerarios: ItinerarioVuelo[];
  pasajeros: PasajeroVueloRequisito[];
  detallesExtra?: Record<string, any>;
}

export interface ItinerarioVuelo {
  duracionMinutos: number;
  segmentos: SegmentoVuelo[];
}

export interface SegmentoVuelo {
  origen: Aeropuerto;
  destino: Aeropuerto;
  fechaSalida: string; // ISO 8601
  fechaLlegada: string; // ISO 8601
  aerolinea: Aerolinea;
  numeroVuelo: string;
  duracionMinutos: number;
  claseCabina: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface Aeropuerto {
  iataCode: string;
  nombre?: string;
  ciudad?: string;
  terminal?: string;
}

export interface Aerolinea {
  iataCode: string;
  nombre: string;
  logoUrl?: string;
}

export interface PasajeroVueloRequisito {
  tipo: 'adult' | 'child' | 'infant';
  cantidad: number;
}

// ==========================================
// HOTELES (HOTELS)
// ==========================================

export interface HotelUnificado {
  id: string; // ID interno o código normalizado
  proveedor: 'hotelbeds' | 'ratehawk' | 'agregador';
  referenciaProveedor: string;
  nombre: string;
  estrellas: number;
  descripcion: string;
  imagenes: string[];
  ubicacion: UbicacionHotel;
  amenidades: string[];
  ofertasDisponibles: OfertaHotelUnificada[]; // Opciones de habitaciones con precio
}

export interface UbicacionHotel {
  latitud?: number;
  longitud?: number;
  direccion: string;
  ciudad: string;
  pais: string;
  codigoPostal?: string;
}

export interface OfertaHotelUnificada {
  id: string;
  proveedor: string; // Necesario si viene de un agregador y el hotel tiene múltiples proveedores
  habitacion: HabitacionHotel;
  precioTotal: number;
  moneda: string;
  politicaCancelacion: PoliticaCancelacion;
  incluyeDesayuno: boolean;
  detallesExtra?: Record<string, any>; // Ej: rateKey de Hotelbeds
}

export interface HabitacionHotel {
  nombre: string;
  tipoCama?: string;
  capacidadAdultos: number;
  capacidadNinos: number;
}

export interface PoliticaCancelacion {
  esReembolsable: boolean;
  fechaLimiteGratuita?: string; // ISO 8601
  penalidad?: number;
}
