// Build: 03 Jun 2026 - 16:00 CST - v2.342

import { HotelUnificado, VueloUnificado } from './unified-travel';

/**
 * Interfaces Core para los Adaptadores de Proveedores
 * 
 * Garantiza que cualquier nuevo proveedor que se conecte
 * cumpla con el mismo contrato y devuelva los modelos unificados.
 */

export interface ParametrosBusquedaVuelo {
  origenIata: string;
  destinoIata: string;
  fechaSalida: string; // YYYY-MM-DD
  fechaRegreso?: string; // YYYY-MM-DD (opcional para Solo Ida)
  pasajeros: {
    adultos: number;
    ninos: number;
    bebes: number;
  };
  clase?: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface ParametrosBusquedaHotel {
  destino: string; // Código de destino, ciudad, o lat/long dependiendo del agregador
  fechaEntrada: string; // YYYY-MM-DD
  fechaSalida: string; // YYYY-MM-DD
  habitaciones: {
    adultos: number;
    edadesNinos?: number[];
  }[];
}

export interface RespuestaBusqueda<T> {
  exito: boolean;
  resultados: T[];
  proveedorInfo: string;
  errores?: string[];
  tiempoRespuestaMs?: number;
}

/**
 * Interfaz que deben implementar los adaptadores de vuelos (ej. DuffelAdapter)
 */
export interface IProveedorVuelo {
  nombreProveedor: string;
  buscarVuelos(params: ParametrosBusquedaVuelo): Promise<RespuestaBusqueda<VueloUnificado>>;
  
  // Métodos futuros para confirmar precio, crear reserva, etc.
  // cotizarVuelo(ofertaId: string): Promise<any>;
  // reservarVuelo(ofertaId: string, pasajerosInfo: any): Promise<any>;
}

/**
 * Interfaz que deben implementar los adaptadores de hoteles (ej. HotelbedsAdapter, RatehawkAdapter)
 */
export interface IProveedorHotel {
  nombreProveedor: string;
  buscarHoteles(params: ParametrosBusquedaHotel): Promise<RespuestaBusqueda<HotelUnificado>>;
  
  // Métodos futuros para confirmar tarifa, reservar, etc.
  // verificarTarifa(ofertaId: string): Promise<any>;
  // reservarHotel(ofertaId: string, huespedesInfo: any): Promise<any>;
}

import { RestauranteUnificado, ActividadUnificada } from './unified-travel';

export interface ParametrosBusquedaRestaurante {
  destino: string; // Ciudad, barrio o coordenadas
  fecha?: string;
  comensales?: number;
  cocina?: string[];
}

export interface IProveedorRestaurante {
  nombreProveedor: string;
  buscarRestaurantes(params: ParametrosBusquedaRestaurante): Promise<RespuestaBusqueda<RestauranteUnificado>>;
}

export interface ParametrosBusquedaActividad {
  destino: string; // Ciudad o id destino
  fecha?: string; // opcional
}

export interface IProveedorActividad {
  nombreProveedor: string;
  buscarActividades(params: ParametrosBusquedaActividad): Promise<RespuestaBusqueda<ActividadUnificada>>;
}
